import type { EdgeSegment } from './types';
import { segmentStartPoint } from './bezier';

export function traceOutline(ctx: CanvasRenderingContext2D | Path2D, outline: EdgeSegment[]): void {
  if (outline.length === 0) return;
  const first = segmentStartPoint(outline[0]);
  if (ctx instanceof Path2D) {
    ctx.moveTo(first.x, first.y);
    for (const seg of outline) {
      if (seg.kind === 'line') {
        ctx.lineTo(seg.p1.x, seg.p1.y);
      } else {
        const c = seg.curve;
        ctx.bezierCurveTo(c.p1.x, c.p1.y, c.p2.x, c.p2.y, c.p3.x, c.p3.y);
      }
    }
    ctx.closePath();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (const seg of outline) {
    if (seg.kind === 'line') {
      ctx.lineTo(seg.p1.x, seg.p1.y);
    } else {
      const c = seg.curve;
      ctx.bezierCurveTo(c.p1.x, c.p1.y, c.p2.x, c.p2.y, c.p3.x, c.p3.y);
    }
  }
  ctx.closePath();
}

export function outlineToPath2D(outline: EdgeSegment[]): Path2D {
  const path = new Path2D();
  traceOutline(path, outline);
  return path;
}
