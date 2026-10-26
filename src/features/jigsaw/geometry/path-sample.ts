import { evaluateCubic } from './bezier';
import type { EdgeSegment, Point } from './types';

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function sampleLine(p0: Point, p1: Point, steps: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t });
  }
  return pts;
}

function sampleCubic(curve: Parameters<typeof evaluateCubic>[0], steps: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(evaluateCubic(curve, i / steps));
  }
  return pts;
}

function denseSampleSegments(segments: EdgeSegment[], stepsPerSegment = 32): Point[] {
  const dense: Point[] = [];
  for (const seg of segments) {
    const part =
      seg.kind === 'line'
        ? sampleLine(seg.p0, seg.p1, stepsPerSegment)
        : sampleCubic(seg.curve, stepsPerSegment);
    if (dense.length > 0 && part.length > 0) {
      part.shift();
    }
    dense.push(...part);
  }
  return dense;
}

function cumulativeLengths(points: Point[]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
  }
  return cum;
}

function interpolatePolyline(points: Point[], cum: number[], targetLen: number): Point {
  if (points.length === 1) return points[0];
  const total = cum[cum.length - 1];
  if (total === 0) return points[0];
  let u = Math.max(0, Math.min(targetLen, total));
  for (let i = 1; i < cum.length; i++) {
    if (u <= cum[i]) {
      const segLen = cum[i] - cum[i - 1];
      const t = segLen === 0 ? 0 : (u - cum[i - 1]) / segLen;
      const a = points[i - 1];
      const b = points[i];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return points[points.length - 1];
}

/** Evenly spaced points along segment polyline (arc-length). */
export function resampleSegments(segments: EdgeSegment[], count: number): Point[] {
  if (count < 2) throw new Error('count must be at least 2');
  const dense = denseSampleSegments(segments, 32);
  if (dense.length === 0) return [];
  const cum = cumulativeLengths(dense);
  const total = cum[cum.length - 1];
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * total;
    out.push(interpolatePolyline(dense, cum, target));
  }
  return out;
}

export function resamplePolyline(points: Point[], count: number): Point[] {
  if (points.length === 0) return [];
  const cum = cumulativeLengths(points);
  const total = cum[cum.length - 1];
  if (total === 0) return Array.from({ length: count }, () => ({ ...points[0] }));
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * total;
    out.push(interpolatePolyline(points, cum, target));
  }
  return out;
}
