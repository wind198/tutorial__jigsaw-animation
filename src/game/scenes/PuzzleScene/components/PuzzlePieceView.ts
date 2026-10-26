import Phaser from 'phaser';
import type { PieceGeometry } from '../../../../features/jigsaw/geometry/types';
import { buildPieceTextureKey } from '../../../../features/jigsaw/rendering/piece-texture-factory';
import { restingPieceDepth } from '../../../shared/depthPolicy';
import { PUZZLE_SOURCE_SIZE } from './puzzleSourceImage';
import { sortRestingPiecesInTray } from './trayPieceOrder';

/** Extra hit slop beyond geometry bounds (stroke/shadow/tab grab tolerance). */
const INTERACTION_PAD = 8;

function applyContactShadow(
  shadow: Phaser.GameObjects.Ellipse,
  boundsW: number,
  boundsH: number,
  mode: PieceShadowMode,
): void {
  const baseW = boundsW * 0.82;
  const baseH = Math.max(10, boundsH * 0.2);
  shadow.setSize(baseW, baseH);
  switch (mode) {
    case 'drag':
      shadow.setVisible(true);
      shadow.setPosition(0, 11);
      shadow.setAlpha(0.4);
      shadow.setScale(1.12);
      break;
    case 'locked':
      shadow.setVisible(false);
      break;
    default:
      shadow.setVisible(true);
      shadow.setPosition(0, 7);
      shadow.setAlpha(0.26);
      shadow.setScale(1);
      break;
  }
}

export interface PieceLayers {
  pieceLayer: Phaser.GameObjects.Container;
  lockedLayer: Phaser.GameObjects.Container;
  dragLayer: Phaser.GameObjects.Container;
}

export type PieceShadowMode = 'tray' | 'drag' | 'locked';

export interface PieceViewHandle {
  geometry: PieceGeometry;
  container: Phaser.GameObjects.Container;
  contactShadow: Phaser.GameObjects.Ellipse;
  restingDepth: number;
  /** Tray rest position (container center) in Phaser world space; set by `computePieceHome`. */
  homeX: number;
  /** Tray rest position (container center) in Phaser world space; set by `computePieceHome`. */
  homeY: number;
}

export interface PieceDragCallbacks {
  canStartDrag: (piece: PieceViewHandle) => boolean;
  onDragStart: (piece: PieceViewHandle) => void;
  isDragging: (piece: PieceViewHandle) => boolean;
  onDragEnd: (piece: PieceViewHandle) => void;
}

export function spawnPieceView(
  scene: Phaser.Scene,
  geometry: PieceGeometry,
  index: number,
  boardSize: number,
  sourceCanvas: HTMLCanvasElement,
  layers: PieceLayers,
  callbacks: PieceDragCallbacks,
): PieceViewHandle {
  const textureKey = buildPieceTextureKey(
    scene,
    geometry,
    sourceCanvas,
    boardSize,
    PUZZLE_SOURCE_SIZE,
  );
  const { width: w, height: h } = geometry.bounds;
  const contactShadow = scene.add.ellipse(0, 7, w * 0.82, Math.max(10, h * 0.2), 0x2a1810, 0.26);
  const image = scene.add
    .image(0, 0, textureKey)
    .setOrigin(0.5)
    .setDisplaySize(w, h);
  const container = scene.add.container(0, 0, [contactShadow, image]);
  applyContactShadow(contactShadow, w, h, 'tray');
  const pad = INTERACTION_PAD;
  const hitW = w + pad * 2;
  const hitH = h + pad * 2;
  container.setSize(hitW, hitH);
  // Container input adds displayOrigin (width/2, height/2) before hit test — use (0,0,w,h), not center-origin rect.
  container.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, hitW, hitH),
    Phaser.Geom.Rectangle.Contains,
  );
  container.input!.dropZone = false;
  scene.input.setDraggable(container);
  scene.input.topOnly = true;

  const restingDepth = restingPieceDepth(index);
  container.setDepth(restingDepth);
  layers.pieceLayer.add(container);

  const handle: PieceViewHandle = {
    geometry,
    container,
    contactShadow,
    restingDepth,
    homeX: 0,
    homeY: 0,
  };

  container.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
    if (!callbacks.canStartDrag(handle)) return;
    layers.pieceLayer.bringToTop(container);
    callbacks.onDragStart(handle);
    layers.pieceLayer.remove(container, false);
    layers.dragLayer.add(container);
    container.setDepth(0);
    container.setScale(1.035);
    applyContactShadow(contactShadow, w, h, 'drag');
    container.setData('dragOffsetX', container.x - pointer.worldX);
    container.setData('dragOffsetY', container.y - pointer.worldY);
  });

  container.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer) => {
    if (!callbacks.isDragging(handle)) return;
    container.setPosition(
      pointer.worldX + Number(container.getData('dragOffsetX')),
      pointer.worldY + Number(container.getData('dragOffsetY')),
    );
  });

  container.on(Phaser.Input.Events.DRAG_END, () => {
    callbacks.onDragEnd(handle);
  });

  return handle;
}

export function resetPieceLiftVisual(piece: PieceViewHandle): void {
  piece.container.setScale(1);
  applyContactShadow(
    piece.contactShadow,
    piece.geometry.bounds.width,
    piece.geometry.bounds.height,
    'tray',
  );
}

export function movePieceToLockedLayer(
  piece: PieceViewHandle,
  layers: PieceLayers,
): void {
  layers.dragLayer.remove(piece.container, false);
  layers.pieceLayer.remove(piece.container, false);
  layers.lockedLayer.add(piece.container);
  piece.container.setDepth(piece.geometry.id);
  applyContactShadow(piece.contactShadow, piece.geometry.bounds.width, piece.geometry.bounds.height, 'locked');
}

export function movePieceToTrayLayer(
  piece: PieceViewHandle,
  layers: PieceLayers,
  trayPieces?: PieceViewHandle[],
): void {
  layers.dragLayer.remove(piece.container, false);
  layers.lockedLayer.remove(piece.container, false);
  layers.pieceLayer.add(piece.container);
  piece.container.setDepth(piece.restingDepth);
  applyContactShadow(piece.contactShadow, piece.geometry.bounds.width, piece.geometry.bounds.height, 'tray');
  if (trayPieces) {
    sortRestingPiecesInTray(layers.pieceLayer, trayPieces);
  }
}
