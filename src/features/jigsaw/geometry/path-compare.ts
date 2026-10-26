import { resampleSegments } from './path-sample';
import type { EdgeSegment, Point } from './types';

export type PathDistanceResult = {
  maxDistance: number;
  rmsDistance: number;
};

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Translate `b` so first points align (start-point alignment). */
export function alignPolylinesByStart(a: Point[], b: Point[]): Point[] {
  if (a.length === 0 || b.length === 0) return b;
  const dx = a[0].x - b[0].x;
  const dy = a[0].y - b[0].y;
  return b.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

export function compareResampledPolylines(a: Point[], b: Point[]): PathDistanceResult {
  if (a.length !== b.length || a.length === 0) {
    throw new Error('compareResampledPolylines requires equal non-empty lengths.');
  }
  let sumSq = 0;
  let maxD = 0;
  for (let i = 0; i < a.length; i++) {
    const d = dist(a[i], b[i]);
    maxD = Math.max(maxD, d);
    sumSq += d * d;
  }
  return { maxDistance: maxD, rmsDistance: Math.sqrt(sumSq / a.length) };
}

export function compareSegmentPaths(
  target: EdgeSegment[],
  generated: EdgeSegment[],
  sampleCount = 256,
): PathDistanceResult {
  const a = resampleSegments(target, sampleCount);
  let b = resampleSegments(generated, sampleCount);
  b = alignPolylinesByStart(a, b);
  return compareResampledPolylines(a, b);
}

export function compareSegmentPathsFromSvg(
  svgSegments: EdgeSegment[],
  generated: EdgeSegment[],
  sampleCount = 256,
): PathDistanceResult {
  return compareSegmentPaths(svgSegments, generated, sampleCount);
}
