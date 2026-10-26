import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SHAPE } from '../../../src/features/jigsaw/config/puzzle-config';
import { extractTabCurveSegments } from '../../../src/features/jigsaw/geometry/extract-tab-segments';
import { buildEdgeProfile } from '../../../src/features/jigsaw/geometry/edge-profile';
import { compareSegmentPaths } from '../../../src/features/jigsaw/geometry/path-compare';
import { resampleSegments } from '../../../src/features/jigsaw/geometry/path-sample';
import { extractPathDFromSvg, parseSvgPathToSegments } from '../../../src/features/jigsaw/geometry/svg-path';
import type { EdgeSegment, Point } from '../../../src/features/jigsaw/geometry/types';

const FIXTURE = join(
  dirname(fileURLToPath(import.meta.url)),
  '../fixtures/edges/reference-piece-tab.svg',
);

function shiftSegments(segments: EdgeSegment[], dx: number, dy: number): EdgeSegment[] {
  const shift = (p: Point) => ({ x: p.x - dx, y: p.y - dy });
  return segments.map((s) =>
    s.kind === 'line'
      ? { kind: 'line', p0: shift(s.p0), p1: shift(s.p1) }
      : {
          kind: 'cubic',
          curve: {
            p0: shift(s.curve.p0),
            p1: shift(s.curve.p1),
            p2: shift(s.curve.p2),
            p3: shift(s.curve.p3),
          },
        },
  );
}

function scaleBulgeX(segments: EdgeSegment[], scale: number): EdgeSegment[] {
  const sx = (p: Point) => ({ x: p.x * scale, y: p.y });
  return segments.map((s) =>
    s.kind === 'line'
      ? { kind: 'line', p0: sx(s.p0), p1: sx(s.p1) }
      : {
          kind: 'cubic',
          curve: { p0: sx(s.curve.p0), p1: sx(s.curve.p1), p2: sx(s.curve.p2), p3: sx(s.curve.p3) },
        },
  );
}

function maxBulgeX(segments: EdgeSegment[]): number {
  const pts = resampleSegments(segments, 128);
  return Math.max(...pts.map((p) => p.x));
}

function referenceTabVerticalScaled(): EdgeSegment[] {
  const svg = readFileSync(FIXTURE, 'utf8');
  const d = extractPathDFromSvg(svg);
  const segments = parseSvgPathToSegments(d);
  const tab = shiftSegments(segments.slice(1, 7), 150, 30);
  const scale = 2;
  const map = (p: Point): Point => ({ x: p.x * scale, y: p.y * scale });
  return tab.map((s) =>
    s.kind === 'line'
      ? { kind: 'line', p0: map(s.p0), p1: map(s.p1) }
      : {
          kind: 'cubic',
          curve: { p0: map(s.curve.p0), p1: map(s.curve.p1), p2: map(s.curve.p2), p3: map(s.curve.p3) },
        },
  );
}

describe('reference piece tab', () => {
  it('vertical tab curve matches reference after bulge scale align', () => {
    const target = referenceTabVerticalScaled();
    const generated = extractTabCurveSegments(
      buildEdgeProfile({ x: 0, y: 0 }, { x: 0, y: 100 }, 1, DEFAULT_SHAPE, 0.5),
    );
    const refPeak = maxBulgeX(target);
    const genPeak = maxBulgeX(generated);
    const alignedTarget = scaleBulgeX(target, genPeak / refPeak);
    const { maxDistance, rmsDistance } = compareSegmentPaths(alignedTarget, generated, 320);
    expect(maxDistance, `max=${maxDistance.toFixed(2)} rms=${rmsDistance.toFixed(2)}`).toBeLessThanOrEqual(85);
  });
});
