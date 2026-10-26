import type { Point } from './types';

/** SVG circular arc: center from endpoints, radius, sweep-flag (1 = clockwise). */
export function centerFromSvgArc(p0: Point, p1: Point, radius: number, sweep: number): Point {
  const mx = (p0.x + p1.x) / 2;
  const my = (p0.y + p1.y) / 2;
  const dx = (p1.x - p0.x) / 2;
  const dy = (p1.y - p0.y) / 2;
  const chordHalf = Math.hypot(dx, dy);
  if (chordHalf < 1e-9) return { x: mx, y: my };
  if (radius < chordHalf - 1e-6) {
    throw new Error('Arc radius smaller than half-chord.');
  }
  const h = Math.sqrt(radius * radius - chordHalf * chordHalf);
  // SVG sweep 0 vs 1 picks the two circle centers; match canvas/edge-profile outward arcs.
  const side = sweep === 1 ? 1 : -1;
  return {
    x: mx + side * (h * -dy) / chordHalf,
    y: my + side * (h * dx) / chordHalf,
  };
}
