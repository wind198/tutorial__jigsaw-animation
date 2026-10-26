import type { PieceGeometry } from './geometry/types';
import type { PieceState } from './types';

export class JigsawPuzzle {
  readonly pieces: readonly PieceGeometry[];
  readonly pieceCount: number;
  private readonly states: PieceState[];

  constructor(pieces: readonly PieceGeometry[]) {
    this.pieces = pieces;
    this.pieceCount = pieces.length;
    this.states = pieces.map(() => 'resting');
  }

  getState(id: number): PieceState {
    return this.states[id];
  }

  setState(id: number, state: PieceState): void {
    this.states[id] = state;
  }

  placedCount(): number {
    return this.states.filter((s) => s === 'locked').length;
  }

  isComplete(): boolean {
    return this.placedCount() === this.pieceCount;
  }

  statusMessage(): string {
    const placed = this.placedCount();
    if (placed === 0) {
      return 'Drag each piece into its matching place!';
    }
    if (placed === this.pieceCount) {
      return 'Amazing! You finished the puzzle! ⭐';
    }
    return `${placed} of ${this.pieceCount} pieces — great job!`;
  }
}
