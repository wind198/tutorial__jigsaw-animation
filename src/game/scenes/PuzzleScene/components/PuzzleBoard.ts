import Phaser from 'phaser';
import { SceneDepth } from '../../../shared/depthPolicy';
import type { BoardLayout } from '../PuzzleSceneLayout';

const COLORS = {
  wood: 0x9d6238,
  woodLight: 0xc58b52,
  cream: 0xfff7e5,
  shadow: 0x5b402b,
};

const VIEWPORT_INSET = 18;

export function drawSceneBackground(
  scene: Phaser.Scene,
  width: number,
  height: number,
): Phaser.GameObjects.Graphics {
  scene.cameras.main.setBackgroundColor('#f6e8c8');
  const panelW = width - VIEWPORT_INSET * 2;
  const panelH = height - VIEWPORT_INSET * 2;
  const panelX = (width - panelW) / 2;
  const panelY = (height - panelH) / 2;
  return scene.add
    .graphics()
    // .fillStyle(0xfff0d2, 1)
    .fillRoundedRect(panelX, panelY, panelW, panelH, 34)
    .setDepth(SceneDepth.background);
}

export function drawPuzzleBoard(
  scene: Phaser.Scene,
  boardLayer: Phaser.GameObjects.Container,
  layout: BoardLayout,
): void {
  const { boardX, boardY, boardSize, cellSize } = layout;
  const framePad = 12;
  const outerR = 22;
  const innerR = 10;

  const board = scene.add.graphics();
  // Ground shadow
  board
    .fillStyle(COLORS.shadow, 0.28)
    .fillRoundedRect(boardX + 9, boardY + 14, boardSize, boardSize, outerR);
  board
    .fillStyle(COLORS.shadow, 0.12)
    .fillRoundedRect(boardX + 5, boardY + 8, boardSize, boardSize, outerR);
  // Wood frame (beveled lip)
  board
    .fillStyle(COLORS.wood, 1)
    .fillRoundedRect(
      boardX - framePad,
      boardY - framePad,
      boardSize + framePad * 2,
      boardSize + framePad * 2,
      outerR,
    );
  board
    .fillStyle(COLORS.woodLight, 1)
    .fillRoundedRect(
      boardX - 5,
      boardY - 5,
      boardSize + 10,
      boardSize + 10,
      17,
    );
  board
    .lineStyle(2, 0xffffff, 0.22)
    .strokeRoundedRect(
      boardX - framePad + 2,
      boardY - framePad + 2,
      boardSize + framePad * 2 - 4,
      boardSize + framePad * 2 - 4,
      outerR - 2,
    );
  board
    .lineStyle(3, 0x5c3a22, 0.35)
    .strokeRoundedRect(
      boardX - 3,
      boardY - 3,
      boardSize + 6,
      boardSize + 6,
      innerR + 4,
    );
  // Recessed play surface
  board.fillStyle(COLORS.cream, 1).fillRoundedRect(boardX, boardY, boardSize, boardSize, innerR);
  board
    .fillStyle(0xead9b8, 0.55)
    .fillRect(boardX + innerR, boardY + boardSize * 0.55, boardSize - innerR * 2, boardSize * 0.45 - innerR);
  board
    .lineStyle(4, 0x3d2814, 0.12)
    .strokeRoundedRect(boardX + 3, boardY + 3, boardSize - 6, boardSize - 6, innerR - 2);
  board
    .lineStyle(2, 0xffffff, 0.35)
    .strokeRoundedRect(boardX + 1, boardY + 1, boardSize - 2, boardSize - 2, innerR);
  boardLayer.add(board);

  const guides = scene.add.graphics();
  guides.lineStyle(2, 0xc5a57b, 0.8);
  for (let i = 1; i < 3; i++) {
    guides.lineBetween(
      boardX + i * cellSize,
      boardY,
      boardX + i * cellSize,
      boardY + boardSize,
    );
    guides.lineBetween(
      boardX,
      boardY + i * cellSize,
      boardX + boardSize,
      boardY + i * cellSize,
    );
  }
  boardLayer.add(guides);
}
