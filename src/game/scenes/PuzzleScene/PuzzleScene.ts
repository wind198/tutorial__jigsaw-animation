import Phaser from 'phaser';
import { createPuzzleDefinitions } from '../../../features/jigsaw/create-puzzle-definitions';
import { JigsawPuzzle } from '../../../features/jigsaw/JigsawPuzzle';
import { boardTarget, shouldSnapToTarget } from '../../../features/jigsaw/SnapRules';
import { SceneDepth } from '../../shared/depthPolicy';
import {
  computeBoardLayout,
  computePieceHome,
  type BoardLayout,
} from './PuzzleSceneLayout';
import { drawPuzzleBoard } from './components/PuzzleBoard';
import { runCompletionCelebration } from './components/CompletionCelebration';
import { PuzzleHUD } from './components/PuzzleHUD';
import { sortRestingPiecesInTray } from './components/trayPieceOrder';
import {
  movePieceToLockedLayer,
  movePieceToTrayLayer,
  resetPieceLiftVisual,
  spawnPieceView,
  type PieceLayers,
  type PieceViewHandle,
} from './components/PuzzlePieceView';
import {
  puzzleSourceUrl,
  rasterizePuzzleSource,
} from './components/puzzleSourceImage';

export class PuzzleScene extends Phaser.Scene {
  // keep the board layout configuration in this class
  private layout!: BoardLayout;
  
  // keep game state in this class
  private puzzle!: JigsawPuzzle;
  

  // keep the pieces information in this class
  private pieces: PieceViewHandle[] = [];


  /** Full puzzle image raster (600×600); read when baking per-piece textures, not the Phaser game canvas. */
  private sourceCanvas!: HTMLCanvasElement;

  // head up display, we should show the status of the game to the user
  private hud!: PuzzleHUD;

  /**
   * Display layers (scene containers at fixed depths — see `SceneDepth`).
   * Pieces reparent between the three piece layers on drag / snap / drop; board stays static.
   *
   * - boardLayer: wood frame, cream grid, guides (never holds piece sprites).
   * - lockedLayer: pieces snapped on the board.
   * - pieceLayer: loose tray pieces waiting to be dragged.
   * - dragLayer: active drag only; highest piece depth so the cursor piece draws above locked + tray.
   */
  private boardLayer!: Phaser.GameObjects.Container;
  private lockedLayer!: Phaser.GameObjects.Container;
  private pieceLayer!: Phaser.GameObjects.Container;
  private dragLayer!: Phaser.GameObjects.Container;
  private backgroundPanel?: Phaser.GameObjects.Graphics;

  constructor() {
    // pass scene key to the super constructor
    super('PuzzleScene');
  }

  preload(): void {
    // load the puzzle source image
    this.load.image('puzzle-source', puzzleSourceUrl);
  }

  create(): void {
    const image = this.textures.get('puzzle-source').getSourceImage() as CanvasImageSource;
    // rasterize the puzzle source image to a canvas
    this.sourceCanvas = rasterizePuzzleSource(image);

    // add the board layer to the scene, position at top left corner, depth is SceneDepth.board
    this.boardLayer = this.add.container(0, 0).setDepth(SceneDepth.board);
    // add the locked layer to the scene, position at top left corner, depth is SceneDepth.locked
    this.lockedLayer = this.add.container(0, 0).setDepth(SceneDepth.locked);
    // add the piece layer to the scene, position at top left corner, depth is SceneDepth.pieces
    this.pieceLayer = this.add.container(0, 0).setDepth(SceneDepth.pieces);
    // add the drag layer to the scene, position at top left corner, depth is SceneDepth.drag
    this.dragLayer = this.add.container(0, 0).setDepth(SceneDepth.drag);

    this.hud = new PuzzleHUD(this);
    this.hud.setupHud('Drag each piece into its matching place!');

    this.buildBoardAndPieces();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private get layers(): PieceLayers {
    return {
      pieceLayer: this.pieceLayer,
      lockedLayer: this.lockedLayer,
      dragLayer: this.dragLayer,
    };
  }

  private buildBoardAndPieces(): void {
    const { width, height } = this.scale.gameSize;
    this.layout = computeBoardLayout(width, height);

    this.backgroundPanel?.destroy();
    // this.backgroundPanel = drawSceneBackground(this, width, height);

    this.pieces.forEach((piece) => piece.container.destroy());
    this.boardLayer.removeAll(true);
    this.lockedLayer.removeAll(true);
    this.pieceLayer.removeAll(true);
    this.dragLayer.removeAll(true);
    this.pieces = [];

    drawPuzzleBoard(this, this.boardLayer, this.layout);

    const boardSize = this.layout.boardSize;
    const puzzlePieces = createPuzzleDefinitions({
      rows: 3,
      cols: 3,
      boardWidth: boardSize,
      boardHeight: boardSize,
      seed: 2026,
      preset: 'classic',
    });
    this.puzzle = new JigsawPuzzle(puzzlePieces);

    const callbacks = {
      canStartDrag: (piece: PieceViewHandle) =>
        this.puzzle.getState(piece.geometry.id) === 'resting',
      onDragStart: (piece: PieceViewHandle) => {
        this.puzzle.setState(piece.geometry.id, 'dragging');
        piece.restingDepth = piece.container.depth;
      },
      isDragging: (piece: PieceViewHandle) =>
        this.puzzle.getState(piece.geometry.id) === 'dragging',
      onDragEnd: (piece: PieceViewHandle) => this.finishDrag(piece),
    };

    puzzlePieces.forEach((geometry, index) => {
      this.pieces.push(
        spawnPieceView(
          this,
          geometry,
          index,
          this.layout.boardSize,
          this.sourceCanvas,
          this.layers,
          callbacks,
        ),
      );
    });

    this.hud.setCenterX(width / 2);
    this.hud.setMessage(this.puzzle.statusMessage());
    this.layoutTrayPieces();
  }

  private layoutTrayPieces(): void {
    const { width, height } = this.scale.gameSize;
    this.pieces.forEach((piece, index) => {
      const home = computePieceHome(
        this.layout,
        index,
        piece.geometry.bounds.width,
        width,
        height,
      );
      piece.homeX = home.x;
      piece.homeY = home.y;
      piece.container.setPosition(home.x, home.y);
    });
    sortRestingPiecesInTray(this.layers.pieceLayer, this.pieces);
  }

  private finishDrag(piece: PieceViewHandle): void {
    if (this.puzzle.getState(piece.geometry.id) !== 'dragging') return;

    resetPieceLiftVisual(piece);
    const { boardX, boardY, cellSize } = this.layout;
    const snapped = shouldSnapToTarget(
      piece.container.x,
      piece.container.y,
      boardX,
      boardY,
      piece.geometry,
      cellSize,
    );

    if (snapped) {
      this.puzzle.setState(piece.geometry.id, 'snapping');
      piece.container.disableInteractive();
      const target = boardTarget(boardX, boardY, piece.geometry);
      this.tweens.add({
        targets: piece.container,
        x: target.x,
        y: target.y,
        scaleX: 1,
        scaleY: 1,
        duration: 230,
        ease: 'Back.Out',
        onComplete: () => {
          this.puzzle.setState(piece.geometry.id, 'locked');
          movePieceToLockedLayer(piece, this.layers);
          this.hud.setMessage(this.puzzle.statusMessage());
          if (this.puzzle.isComplete()) {
            this.handlePuzzleComplete();
          }
        },
      });
      return;
    }

    this.puzzle.setState(piece.geometry.id, 'dropping');
    this.tweens.add({
      targets: piece.container,
      x: piece.homeX,
      y: piece.homeY + 8,
      duration: 130,
      ease: 'Quad.Out',
      onComplete: () => {
        this.tweens.add({
          targets: piece.container,
          y: piece.homeY,
          duration: 110,
          ease: 'Bounce.Out',
          onComplete: () => {
            this.puzzle.setState(piece.geometry.id, 'resting');
            movePieceToTrayLayer(piece, this.layers, this.pieces);
          },
        });
      },
    });
  }

  private handlePuzzleComplete(): void {
    runCompletionCelebration(
      this,
      this.layout,
      this.pieces.map((p) => p.container),
      () => this.buildBoardAndPieces(),
    );
  }

  private handleResize(): void {
    this.buildBoardAndPieces();
  }
}
