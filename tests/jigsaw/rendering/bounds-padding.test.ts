import { describe, expect, it } from 'vitest';
import { DEFAULT_PUZZLE_CONFIG } from '../../../src/features/jigsaw/config/puzzle-config';
import { generatePuzzleGeometry } from '../../../src/features/jigsaw/geometry/jigsaw-generator';

describe('piece texture bounds', () => {
  it('internal piece bounds exceed cell size (tabs included)', () => {
    const cell = 100;
    const g = generatePuzzleGeometry({
      rows: 3,
      cols: 3,
      boardWidth: 3 * cell,
      boardHeight: 3 * cell,
      ...DEFAULT_PUZZLE_CONFIG,
      seed: 7,
    });
    const center = g.pieces.find((p) => p.row === 1 && p.col === 1)!;
    expect(center.bounds.width).toBeGreaterThan(cell);
    expect(center.bounds.height).toBeGreaterThan(cell);
  });
});
