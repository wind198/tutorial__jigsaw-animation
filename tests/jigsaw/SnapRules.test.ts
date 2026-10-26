import { describe, expect, it } from 'vitest';
import type { PieceGeometry } from '../../src/features/jigsaw/geometry/types';
import { shouldSnapToTarget, snapThreshold } from '../../src/features/jigsaw/SnapRules';

function targetOnly(targetX: number, targetY: number): PieceGeometry {
  return { targetX, targetY } as PieceGeometry;
}

describe('SnapRules', () => {
  it('uses a fraction of cell size for snap threshold', () => {
    expect(snapThreshold(100)).toBe(34);
  });

  it('accepts a piece at its exact board target', () => {
    expect(shouldSnapToTarget(120, 90, 70, 40, targetOnly(50, 50), 100)).toBe(true);
  });

  it('rejects a piece far from its target', () => {
    expect(shouldSnapToTarget(10, 10, 70, 40, targetOnly(50, 50), 100)).toBe(false);
  });
});
