import { cubicExtrema, segmentEndPoint, segmentStartPoint } from './bezier';
import type { EdgeSegment } from './types';

export function boundsFromOutline(
  outline: EdgeSegment[],
  padding: number,
): { x: number; y: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const include = (p: { x: number; y: number }) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  };

  for (const seg of outline) {
    if (seg.kind === 'line') {
      include(seg.p0);
      include(seg.p1);
    } else {
      for (const p of cubicExtrema(seg.curve)) include(p);
    }
  }

  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

export function outlineIsClosed(outline: EdgeSegment[], epsilon = 0.5): boolean {
  if (outline.length === 0) return false;
  const first = segmentStartPoint(outline[0]);
  const last = segmentEndPoint(outline[outline.length - 1]);
  return Math.hypot(first.x - last.x, first.y - last.y) <= epsilon;
}
