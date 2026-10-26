import { describe, expect, it } from 'vitest';
import { DEFAULT_PUZZLE_CONFIG, validatePuzzleConfig } from '../../../src/features/jigsaw/config/puzzle-config';
import { reverseEdgeSegments, segmentEndPoint, segmentStartPoint } from '../../../src/features/jigsaw/geometry/bezier';
import { generatePuzzleGeometry } from '../../../src/features/jigsaw/geometry/jigsaw-generator';
import { outlineIsClosed } from '../../../src/features/jigsaw/geometry/bounds';

function baseConfig(rows: number, cols: number) {
  return {
    rows,
    cols,
    boardWidth: cols * 100,
    boardHeight: rows * 100,
    ...DEFAULT_PUZZLE_CONFIG,
  };
}

describe('generatePuzzleGeometry', () => {
  it('rejects invalid config', () => {
    expect(() => validatePuzzleConfig({ ...baseConfig(0, 3) })).toThrow();
    expect(() => validatePuzzleConfig({ ...baseConfig(3, 0) })).toThrow();
  });

  it.each([
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 6],
  ])('generates %i×%i with closed outlines', (rows, cols) => {
    const g = generatePuzzleGeometry(baseConfig(rows, cols));
    expect(g.pieces).toHaveLength(rows * cols);
    expect(g.registry.horizontal).toHaveLength(Math.max(0, rows - 1));
    expect(g.registry.vertical[0]?.length ?? 0).toBe(Math.max(0, cols - 1));
    for (const p of g.pieces) {
      expect(outlineIsClosed(p.outline)).toBe(true);
    }
  });

  it('shares identical internal edge between neighbors', () => {
    const g = generatePuzzleGeometry({ ...baseConfig(3, 3), seed: 42 });
    const at = (r: number, c: number) => g.pieces.find((p) => p.row === r && p.col === c)!;
    const a = at(0, 1);
    const b = at(1, 1);
    expect(a.edges.bottom.id).toBe(b.edges.top.id);
    expect(a.edges.bottom.segments).toBe(b.edges.top.segments);
  });

  it('reverse preserves endpoints', () => {
    const g = generatePuzzleGeometry(baseConfig(2, 2));
    const edge = g.registry.horizontal[0][0];
    const rev = reverseEdgeSegments(edge.segments);
    expect(segmentStartPoint(rev[0]).x).toBeCloseTo(edge.end.x, 5);
    expect(segmentEndPoint(rev[rev.length - 1]).x).toBeCloseTo(edge.start.x, 5);
  });

  it('is deterministic for same seed', () => {
    const a = generatePuzzleGeometry({ ...baseConfig(3, 3), seed: 'alpha' });
    const b = generatePuzzleGeometry({ ...baseConfig(3, 3), seed: 'alpha' });
    expect(a.registry.horizontal[0][0].polarity).toBe(b.registry.horizontal[0][0].polarity);
    expect(a.pieces[0].bounds).toEqual(b.pieces[0].bounds);
  });
});
