import type { EdgeSegment, Point } from './types';

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Number.isInteger(r) ? String(r) : String(r);
}

export function segmentsToSvgPath(segments: EdgeSegment[], close = false): string {
  if (segments.length === 0) return '';
  const parts: string[] = [];
  const first = segments[0];
  const p0 = first.kind === 'line' ? first.p0 : first.curve.p0;
  parts.push(`M ${fmt(p0.x)} ${fmt(p0.y)}`);
  for (const seg of segments) {
    if (seg.kind === 'line') {
      parts.push(`L ${fmt(seg.p1.x)} ${fmt(seg.p1.y)}`);
    } else {
      const c = seg.curve;
      parts.push(
        `C ${fmt(c.p1.x)} ${fmt(c.p1.y)} ${fmt(c.p2.x)} ${fmt(c.p2.y)} ${fmt(c.p3.x)} ${fmt(c.p3.y)}`,
      );
    }
  }
  if (close) parts.push('Z');
  return parts.join(' ');
}

export function outlineToSvgPath(segments: EdgeSegment[], close = false): string {
  return segmentsToSvgPath(segments, close);
}

type PathCommand =
  | { op: 'M'; x: number; y: number }
  | { op: 'L'; x: number; y: number }
  | { op: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { op: 'Z' };

function tokenizePath(d: string): string[] {
  const normalized = d
    .replace(/([MmLlHhVvCcZz])/g, ' $1 ')
    .replace(/,/g, ' ')
    .replace(/-/g, ' -')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.length ? normalized.split(' ') : [];
}

function parsePathCommands(d: string): PathCommand[] {
  const tokens = tokenizePath(d);
  const cmds: PathCommand[] = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let subStartX = 0;
  let subStartY = 0;
  let cmd = '';

  const readNum = (): number => {
    if (i >= tokens.length) throw new Error('Unexpected end of SVG path.');
    return Number.parseFloat(tokens[i++]);
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[MLHVCZmlhvcz]$/.test(t)) {
      cmd = t;
      i++;
    } else if (!cmd) {
      throw new Error(`SVG path missing command before number: ${t}`);
    }

    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();

    if (C === 'M') {
      cx = readNum();
      cy = readNum();
      if (rel) {
        cx += subStartX;
        cy += subStartY;
      }
      subStartX = cx;
      subStartY = cy;
      cmds.push({ op: 'M', x: cx, y: cy });
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      let x = readNum();
      let y = readNum();
      if (rel) {
        x += cx;
        y += cy;
      }
      cx = x;
      cy = y;
      cmds.push({ op: 'L', x, y });
    } else if (C === 'H') {
      let x = readNum();
      if (rel) x += cx;
      cx = x;
      cmds.push({ op: 'L', x: cx, y: cy });
    } else if (C === 'V') {
      let y = readNum();
      if (rel) y += cy;
      cy = y;
      cmds.push({ op: 'L', x: cx, y: cy });
    } else if (C === 'C') {
      let x1 = readNum();
      let y1 = readNum();
      let x2 = readNum();
      let y2 = readNum();
      let x = readNum();
      let y = readNum();
      if (rel) {
        x1 += cx;
        y1 += cy;
        x2 += cx;
        y2 += cy;
        x += cx;
        y += cy;
      }
      cx = x;
      cy = y;
      cmds.push({ op: 'C', x1, y1, x2, y2, x, y });
    } else if (C === 'Z') {
      cx = subStartX;
      cy = subStartY;
      cmds.push({ op: 'Z' });
    } else {
      throw new Error(`Unsupported SVG path command: ${cmd}`);
    }
  }
  return cmds;
}

export function parseSvgPathToSegments(d: string): EdgeSegment[] {
  const cmds = parsePathCommands(d);
  const segments: EdgeSegment[] = [];
  let cur: Point | null = null;

  for (const c of cmds) {
    if (c.op === 'M') {
      cur = { x: c.x, y: c.y };
    } else if (c.op === 'L' && cur) {
      const p1 = { x: c.x, y: c.y };
      segments.push({ kind: 'line', p0: cur, p1 });
      cur = p1;
    } else if (c.op === 'C' && cur) {
      const p0 = cur;
      const p3 = { x: c.x, y: c.y };
      segments.push({
        kind: 'cubic',
        curve: {
          p0,
          p1: { x: c.x1, y: c.y1 },
          p2: { x: c.x2, y: c.y2 },
          p3,
        },
      });
      cur = p3;
    } else if (c.op === 'Z') {
      // open edge fixtures: ignore close
    }
  }
  return segments;
}

export function extractPathDFromSvg(svgText: string): string {
  const match = svgText.match(/<path[^>]*\sd=["']([^"']+)["']/i);
  if (!match) throw new Error('No <path d="..."> found in SVG fixture.');
  return match[1];
}

export function translateSegmentsToOrigin(segments: EdgeSegment[]): EdgeSegment[] {
  if (segments.length === 0) return segments;
  const first = segments[0];
  const ox = first.kind === 'line' ? first.p0.x : first.curve.p0.x;
  const oy = first.kind === 'line' ? first.p0.y : first.curve.p0.y;
  const shift = (p: Point): Point => ({ x: p.x - ox, y: p.y - oy });

  return segments.map((seg) => {
    if (seg.kind === 'line') {
      return { kind: 'line', p0: shift(seg.p0), p1: shift(seg.p1) };
    }
    return {
      kind: 'cubic',
      curve: {
        p0: shift(seg.curve.p0),
        p1: shift(seg.curve.p1),
        p2: shift(seg.curve.p2),
        p3: shift(seg.curve.p3),
      },
    };
  });
}
