import { describe, expect, it } from 'vitest';
import { DEFAULT_PUZZLE_CONFIG } from '../../../src/features/jigsaw/config/puzzle-config';
import { generatePuzzleGeometry } from '../../../src/features/jigsaw/geometry/jigsaw-generator';
describe('piece targets vs bounds', () => {
  it('target is bounds center for every piece', () => {
    const g = generatePuzzleGeometry({
      rows: 3,
      cols: 3,
      boardWidth: 300,
      boardHeight: 300,
      ...DEFAULT_PUZZLE_CONFIG,
    });
    for (const p of g.pieces) {
      expect(p.targetX).toBeCloseTo(p.bounds.x + p.bounds.width / 2, 6);
      expect(p.targetY).toBeCloseTo(p.bounds.y + p.bounds.height / 2, 6);
    }
  });

  it('center cell target differs from naive cell center when tabs asymmetric in bounds', () => {
    const g = generatePuzzleGeometry({
      rows: 3,
      cols: 3,
      boardWidth: 300,
      boardHeight: 300,
      ...DEFAULT_PUZZLE_CONFIG,
    });
    const cell = 100;
    const corner = g.pieces.find((p) => p.row === 0 && p.col === 0)!;
    const cellCenterX = cell / 2;
    const boundsCenterX = corner.bounds.x + corner.bounds.width / 2;
    expect(Math.abs(boundsCenterX - cellCenterX)).toBeGreaterThan(0.5);
  });
});
