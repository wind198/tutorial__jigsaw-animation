import type { PieceGeometry } from './geometry/types';

export function snapThreshold(cellSize: number): number {
  return cellSize * 0.34;
}

export function boardTarget(
  boardX: number,
  boardY: number,
  piece: PieceGeometry,
): { x: number; y: number } {
  return { x: boardX + piece.targetX, y: boardY + piece.targetY };
}

export function withinSnapDistance(
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  threshold: number,
): boolean {
  const dx = x - targetX;
  const dy = y - targetY;
  return dx * dx + dy * dy <= threshold * threshold;
}

export function shouldSnapToTarget(
  pieceX: number,
  pieceY: number,
  boardX: number,
  boardY: number,
  piece: PieceGeometry,
  cellSize: number,
): boolean {
  const target = boardTarget(boardX, boardY, piece);
  return withinSnapDistance(pieceX, pieceY, target.x, target.y, snapThreshold(cellSize));
}
