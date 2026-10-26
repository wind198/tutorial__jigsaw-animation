import { describe, expect, it } from 'vitest';
import { DEFAULT_SHAPE } from '../../../src/features/jigsaw/config/puzzle-config';
import { buildEdgeProfile } from '../../../src/features/jigsaw/geometry/edge-profile';
import { resampleSegments } from '../../../src/features/jigsaw/geometry/path-sample';

describe('edge profile symmetry', () => {
  it('horizontal tab is symmetric about edge midpoint', () => {
    const segs = buildEdgeProfile({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, DEFAULT_SHAPE, 0.5);
    const pts = resampleSegments(segs, 128);
    for (let i = 0; i < pts.length; i++) {
      const q = pts[pts.length - 1 - i];
      expect(pts[i].x).toBeCloseTo(100 - q.x, 1);
      expect(pts[i].y).toBeCloseTo(q.y, 1);
    }
  });

  it('neck width changes outline (wider neck vs narrow)', () => {
    const narrow = buildEdgeProfile(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      1,
      { ...DEFAULT_SHAPE, neckWidthRatio: 0.12 },
      0.5,
    );
    const wide = buildEdgeProfile(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      1,
      { ...DEFAULT_SHAPE, neckWidthRatio: 0.38 },
      0.5,
    );
    const ptsN = resampleSegments(narrow, 64);
    const ptsW = resampleSegments(wide, 64);
    const neckIdx = 18;
    expect(ptsN[neckIdx].y).not.toBeCloseTo(ptsW[neckIdx].y, 0);
  });
});
