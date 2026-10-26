import type Phaser from 'phaser';
import { outlineToPath2D } from '../geometry/outline-path';
import type { PieceGeometry } from '../geometry/types';

export type PieceTextureOptions = {
  scaleFactor?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
  strokeStyle?: string;
  lineWidth?: number;
};

const DEFAULTS: Required<PieceTextureOptions> = {
  scaleFactor: 2,
  shadowColor: 'rgba(45, 28, 12, 0.38)',
  shadowBlur: 10,
  shadowOffsetY: 5,
  strokeStyle: '#fff8e7',
  lineWidth: 2.5,
};

export function buildPieceTextureKey(
  scene: Phaser.Scene,
  piece: PieceGeometry,
  sourceCanvas: HTMLCanvasElement,
  boardSize: number,
  sourceSize: number,
  options: PieceTextureOptions = {},
): string {
  const opts = { ...DEFAULTS, ...options };
  const path = outlineToPath2D(piece.outline);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(piece.bounds.width * opts.scaleFactor);
  canvas.height = Math.ceil(piece.bounds.height * opts.scaleFactor);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is required.');

  ctx.scale(opts.scaleFactor, opts.scaleFactor);
  ctx.translate(-piece.bounds.x, -piece.bounds.y);

  // Contact / cast shadow (cardboard lift off surface)
  ctx.save();
  ctx.translate(2, 6);
  ctx.fillStyle = 'rgba(35, 22, 10, 0.32)';
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = opts.shadowColor;
  ctx.shadowBlur = opts.shadowBlur;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = opts.shadowOffsetY;
  ctx.fillStyle = '#ffffff';
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.clip(path);
  ctx.drawImage(sourceCanvas, 0, 0, sourceSize, sourceSize, 0, 0, boardSize, boardSize);
  // Subtle top light inside piece (depth on photo surface)
  const b = piece.bounds;
  const gloss = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  gloss.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
  gloss.addColorStop(1, 'rgba(0, 0, 0, 0.06)');
  ctx.fillStyle = gloss;
  ctx.fillRect(b.x, b.y, b.width, b.height);
  ctx.restore();

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(52, 32, 14, 0.55)';
  ctx.lineWidth = opts.lineWidth + 1.5;
  ctx.stroke(path);
  ctx.strokeStyle = opts.strokeStyle;
  ctx.lineWidth = opts.lineWidth;
  ctx.stroke(path);

  const key = `piece-${piece.id}`;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  return key;
}
