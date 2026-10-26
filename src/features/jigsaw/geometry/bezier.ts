import type { CubicBezier, EdgeSegment, Point } from './types';

export function reverseCubic(curve: CubicBezier): CubicBezier {
  return {
    p0: curve.p3,
    p1: curve.p2,
    p2: curve.p1,
    p3: curve.p0,
  };
}

export function reverseEdgeSegments(segments: EdgeSegment[]): EdgeSegment[] {
  const out: EdgeSegment[] = [];
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.kind === 'line') {
      out.push({ kind: 'line', p0: seg.p1, p1: seg.p0 });
    } else {
      out.push({ kind: 'cubic', curve: reverseCubic(seg.curve) });
    }
  }
  return out;
}

export function evaluateCubic(curve: CubicBezier, t: number): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x:
      uuu * curve.p0.x +
      3 * uu * t * curve.p1.x +
      3 * u * tt * curve.p2.x +
      ttt * curve.p3.x,
    y:
      uuu * curve.p0.y +
      3 * uu * t * curve.p1.y +
      3 * u * tt * curve.p2.y +
      ttt * curve.p3.y,
  };
}

export function cubicExtrema(curve: CubicBezier): Point[] {
  const points = [curve.p0, curve.p3];
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    points.push(evaluateCubic(curve, t));
  }
  return points;
}

export function segmentEndPoint(seg: EdgeSegment): Point {
  return seg.kind === 'line' ? seg.p1 : seg.curve.p3;
}

export function segmentStartPoint(seg: EdgeSegment): Point {
  return seg.kind === 'line' ? seg.p0 : seg.curve.p0;
}

export function segmentsAreContinuous(segments: EdgeSegment[], epsilon = 0.01): boolean {
  for (let i = 0; i < segments.length - 1; i++) {
    const a = segmentEndPoint(segments[i]);
    const b = segmentStartPoint(segments[i + 1]);
    if (Math.hypot(a.x - b.x, a.y - b.y) > epsilon) return false;
  }
  return true;
}
