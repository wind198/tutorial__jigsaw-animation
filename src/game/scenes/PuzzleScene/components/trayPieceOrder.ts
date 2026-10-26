import type Phaser from 'phaser';
import type { PieceViewHandle } from './PuzzlePieceView';

/** Resting tray list order = draw/input order; higher `restingDepth` ends up on top. */
export function sortRestingPiecesInTray(
  pieceLayer: Phaser.GameObjects.Container,
  pieces: PieceViewHandle[],
): void {
  const inTray = pieces
    .filter((p) => pieceLayer.list.includes(p.container))
    .slice()
    .sort((a, b) => a.restingDepth - b.restingDepth);
  for (const p of inTray) {
    pieceLayer.bringToTop(p.container);
  }
}
