import type { CubicBezier, EdgeSegment, Point, ShapeParams } from './types';

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function offsetAlongNormal(
  start: Point,
  end: Point,
  t: number,
  normalSign: number,
  depth: number,
): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * normalSign;
  const ny = (dx / len) * normalSign;
  const base = lerp(start, end, t);
  return { x: base.x + nx * depth, y: base.y + ny * depth };
}

function pushLine(out: EdgeSegment[], p0: Point, p1: Point): void {
  if (Math.hypot(p1.x - p0.x, p1.y - p0.y) < 1e-6) return;
  out.push({ kind: 'line', p0, p1 });
}

function pushCubic(out: EdgeSegment[], p0: Point, p1: Point, p2: Point, p3: Point): void {
  out.push({ kind: 'cubic', curve: { p0, p1, p2, p3 } });
}

/** v = bulge / peak; u = along tab in [0, 1] (symmetric half uses u ∈ [0, 0.5]). */
const HALF_TAB_CUBICS: { cp1: Point; cp2: Point; p3: Point }[] = [
  { cp1: { x: 0, y: 0.24 }, cp2: { x: 0.257, y: 0.32 }, p3: { x: 0.257, y: 0.32 } },
  { cp1: { x: 0.429, y: 0.32 }, cp2: { x: 0.429, y: 0 }, p3: { x: 0.643, y: 0 } },
  { cp1: { x: 0.9, y: 0 }, cp2: { x: 1, y: 0.24 }, p3: { x: 1, y: 0.5 } },
];

const REF_PEAK_BULGE_RATIO = 70 / 50;
const REF_NECK_U = 0.32;
const REF_SHOULDER_U = 0.24;

/** Map reference u (0–0.5) to symmetric tab u using neck + shoulder widths. */
function mapSymmetricU(uHalf: number, shape: ShapeParams): number {
  const u = Math.max(0, Math.min(0.5, uHalf));
  const uNeck = 0.5 - shape.neckWidthRatio * 0.5;
  const uShoulder = Math.max(0.05, uNeck - (0.5 - uNeck) * (0.35 + shape.bulbWidthRatio * 0.45));

  const refBreaks = [0, REF_SHOULDER_U, REF_NECK_U, 0.5];
  const tgtBreaks = [0, uShoulder, uNeck, 0.5];

  for (let i = 0; i < refBreaks.length - 1; i++) {
    const r0 = refBreaks[i];
    const r1 = refBreaks[i + 1];
    if (u >= r0 && u <= r1) {
      const tr = r1 === r0 ? 0 : (u - r0) / (r1 - r0);
      return tgtBreaks[i] + tr * (tgtBreaks[i + 1] - tgtBreaks[i]);
    }
  }
  return u;
}

function mapBulgeV(v: number, shape: ShapeParams): number {
  if (v <= 0.01) return 0;
  const neckMix = 0.45 + shape.neckDepthRatio * 0.35;
  const shoulderMix = 0.65 + shape.bulbDepthRatio * 0.35;
  if (v >= 0.4 && v <= 0.6) return v * shoulderMix;
  return v * neckMix;
}

function tabPoint(
  start: Point,
  end: Point,
  sign: number,
  t0: number,
  tabLen: number,
  u: number,
  vBulge: number,
  peakBulge: number,
): Point {
  const t = t0 + u * tabLen;
  const base = lerp(start, end, t);
  if (vBulge <= 0) return base;
  return offsetAlongNormal(start, end, t, sign, vBulge * peakBulge);
}

function mirrorPointInTab(p: Point, start: Point, end: Point, t0: number, t3: number): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = ((p.x - start.x) * dx + (p.y - start.y) * dy) / len2;
  const tMir = t0 + t3 - t;
  const baseOrig = lerp(start, end, t);
  const baseMir = lerp(start, end, tMir);
  return {
    x: baseMir.x + (p.x - baseOrig.x),
    y: baseMir.y + (p.y - baseOrig.y),
  };
}

function mirrorCubicInTab(curve: CubicBezier, start: Point, end: Point, t0: number, t3: number): CubicBezier {
  const m = (p: Point) => mirrorPointInTab(p, start, end, t0, t3);
  return { p0: m(curve.p3), p1: m(curve.p2), p2: m(curve.p1), p3: m(curve.p0) };
}

function mirrorHalfTabSegments(
  half: EdgeSegment[],
  start: Point,
  end: Point,
  t0: number,
  t3: number,
): EdgeSegment[] {
  const out: EdgeSegment[] = [];
  for (let i = half.length - 1; i >= 0; i--) {
    const seg = half[i];
    if (seg.kind === 'line') {
      out.push({ kind: 'line', p0: mirrorPointInTab(seg.p1, start, end, t0, t3), p1: mirrorPointInTab(seg.p0, start, end, t0, t3) });
    } else {
      out.push({ kind: 'cubic', curve: mirrorCubicInTab(seg.curve, start, end, t0, t3) });
    }
  }
  return out;
}

function buildHalfTabCubics(
  start: Point,
  end: Point,
  sign: number,
  t0: number,
  tabLen: number,
  peakBulge: number,
  shape: ShapeParams,
  pTabStart: Point,
): EdgeSegment[] {
  const out: EdgeSegment[] = [];
  let p0 = pTabStart;

  for (const { cp1, cp2, p3 } of HALF_TAB_CUBICS) {
    const u1 = mapSymmetricU(cp1.y, shape);
    const u2 = mapSymmetricU(cp2.y, shape);
    const u3 = mapSymmetricU(p3.y, shape);
    const p1 = tabPoint(start, end, sign, t0, tabLen, u1, mapBulgeV(cp1.x, shape), peakBulge);
    const p2 = tabPoint(start, end, sign, t0, tabLen, u2, mapBulgeV(cp2.x, shape), peakBulge);
    const p3p = tabPoint(start, end, sign, t0, tabLen, u3, mapBulgeV(p3.x, shape), peakBulge);
    pushCubic(out, p0, p1, p2, p3p);
    p0 = p3p;
  }
  return out;
}

/**
 * Build interlocking profile along canonical edge start→end.
 * `polarity` ±1 bulges along left normal of the edge direction; 0 is straight.
 */
export function buildEdgeProfile(
  start: Point,
  end: Point,
  polarity: -1 | 0 | 1,
  shape: ShapeParams,
  variation: number,
): EdgeSegment[] {
  if (polarity === 0) {
    return [{ kind: 'line', p0: start, p1: end }];
  }

  const sign = polarity;
  const edgeLen = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const varScale = 1 + (variation - 0.5) * shape.shapeVariation * 2;

  const tabW = shape.tabWidthRatio * varScale;
  const t0 = 0.5 - tabW / 2;
  const t3 = 0.5 + tabW / 2;
  const tabLen = t3 - t0;

  const peakBulge =
    shape.tabDepthRatio * edgeLen * varScale * REF_PEAK_BULGE_RATIO * (0.88 + shape.bulbWidthRatio * 0.08);

  const pTabStart = lerp(start, end, t0);
  const pTabEnd = lerp(start, end, t3);

  const half = buildHalfTabCubics(start, end, sign, t0, tabLen, peakBulge, shape, pTabStart);
  const mirrored = mirrorHalfTabSegments(half, start, end, t0, t3);

  const out: EdgeSegment[] = [];
  pushLine(out, start, pTabStart);
  for (const seg of half) out.push(seg);
  for (const seg of mirrored) out.push(seg);
  pushLine(out, pTabEnd, end);

  return out;
}
