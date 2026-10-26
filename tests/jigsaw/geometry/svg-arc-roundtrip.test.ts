import { describe, expect, it } from 'vitest';
import { DEFAULT_SHAPE } from '../../../src/features/jigsaw/config/puzzle-config';
import { buildEdgeProfile } from '../../../src/features/jigsaw/geometry/edge-profile';
import { compareSegmentPaths } from '../../../src/features/jigsaw/geometry/path-compare';
import { outlineToSvgPath, parseSvgPathToSegments } from '../../../src/features/jigsaw/geometry/svg-path';

describe('SVG arc roundtrip', () => {
  it('parsed path matches generated circular edge', () => {
    const generated = buildEdgeProfile({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, DEFAULT_SHAPE, 0.5);
    const parsed = parseSvgPathToSegments(outlineToSvgPath(generated));
    const { maxDistance } = compareSegmentPaths(parsed, generated, 256);
    expect(maxDistance).toBeLessThanOrEqual(0.05);
  });
});
