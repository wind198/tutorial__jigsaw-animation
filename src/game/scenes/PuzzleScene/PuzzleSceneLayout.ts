export interface BoardLayout {
  /** Inner snap grid top-left in Phaser world space (canvas origin top-left; add to piece board-local targets for screen position). */
  boardX: number;
  /** With `boardX`, top-left of inner snap grid in Phaser world space. */
  boardY: number;
  boardSize: number;
  cellSize: number;
}

export function computeBoardLayout(width: number, height: number): BoardLayout {
  const boardSize = Math.min(width * 0.53, height * 0.68, 510);
  const cellSize = boardSize / 3;
  const boardX = (width - boardSize) / 2;
  const boardY = Math.max(72, (height - boardSize) * 0.36);
  return { boardX, boardY, boardSize, cellSize };
}

export function computePieceHome(
  layout: BoardLayout,
  pieceIndex: number,
  boundsWidth: number,
  gameWidth: number,
  gameHeight: number,
): { x: number; y: number } {
  const { boardX, boardY, boardSize, cellSize } = layout;
  const left = boardX - cellSize * 0.82;
  const right = boardX + boardSize + cellSize * 0.82;
  const side = pieceIndex % 2 === 0 ? 'left' : 'right';
  const col = Math.floor(pieceIndex / 2);
  const x =
    side === 'left'
      ? Math.max(boundsWidth / 2 + 12, left)
      : Math.min(gameWidth - boundsWidth / 2 - 12, right);
  const y = Math.min(
    gameHeight - 95,
    Math.max(100, boardY + (col - 1) * cellSize * 0.82 + cellSize / 2),
  );
  return { x, y };
}
