import { buildEdgeProfile } from './edge-profile';
import { createSeededStreams } from './seeded-random';
import type { Edge, EdgeRegistry, ShapeParams } from './types';

export type GridMetrics = {
  cellW: number;
  cellH: number;
  boardWidth: number;
  boardHeight: number;
};

function outerEdge(id: string, start: { x: number; y: number }, end: { x: number; y: number }): Edge {
  return {
    id,
    kind: 'outer',
    start,
    end,
    polarity: 0,
    segments: [{ kind: 'line', p0: start, p1: end }],
  };
}

export function createEdgeRegistry(
  rows: number,
  cols: number,
  metrics: GridMetrics,
  shape: ShapeParams,
  seed: string | number,
): EdgeRegistry {
  const { cellW, cellH, boardWidth, boardHeight } = metrics;
  const { polarity: randPolarity, variation: randVariation } = createSeededStreams(seed);

  const horizontal: Edge[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    const row: Edge[] = [];
    for (let c = 0; c < cols; c++) {
      const y = (r + 1) * cellH;
      const start = { x: c * cellW, y };
      const end = { x: (c + 1) * cellW, y };
      const pol: -1 | 1 = randPolarity() < 0.5 ? -1 : 1;
      const varT = randVariation();
      const id = `h-${r}-${c}`;
      row.push({
        id,
        kind: 'internal',
        start,
        end,
        polarity: pol,
        segments: buildEdgeProfile(start, end, pol, shape, varT),
      });
    }
    horizontal.push(row);
  }

  const vertical: Edge[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Edge[] = [];
    for (let c = 0; c < cols - 1; c++) {
      const x = (c + 1) * cellW;
      const start = { x, y: r * cellH };
      const end = { x, y: (r + 1) * cellH };
      const pol: -1 | 1 = randPolarity() < 0.5 ? -1 : 1;
      const varT = randVariation();
      const id = `v-${r}-${c}`;
      row.push({
        id,
        kind: 'internal',
        start,
        end,
        polarity: pol,
        segments: buildEdgeProfile(start, end, pol, shape, varT),
      });
    }
    vertical.push(row);
  }

  // stash outer helpers on registry via dummy access — pieces use inline outer edges
  void boardWidth;
  void boardHeight;

  return { horizontal, vertical };
}

export function outerTop(row: number, col: number, metrics: GridMetrics): Edge {
  const { cellW, cellH } = metrics;
  const start = { x: col * cellW, y: row * cellH };
  const end = { x: (col + 1) * cellW, y: row * cellH };
  return outerEdge(`o-top-${row}-${col}`, start, end);
}

export function outerRight(row: number, col: number, metrics: GridMetrics): Edge {
  const { cellW, cellH } = metrics;
  const start = { x: (col + 1) * cellW, y: row * cellH };
  const end = { x: (col + 1) * cellW, y: (row + 1) * cellH };
  return outerEdge(`o-right-${row}-${col}`, start, end);
}

export function outerBottom(row: number, col: number, metrics: GridMetrics): Edge {
  const { cellW, cellH } = metrics;
  const start = { x: col * cellW, y: (row + 1) * cellH };
  const end = { x: (col + 1) * cellW, y: (row + 1) * cellH };
  return outerEdge(`o-bottom-${row}-${col}`, start, end);
}

export function outerLeft(row: number, col: number, metrics: GridMetrics): Edge {
  const { cellW, cellH } = metrics;
  const start = { x: col * cellW, y: row * cellH };
  const end = { x: col * cellW, y: (row + 1) * cellH };
  return outerEdge(`o-left-${row}-${col}`, start, end);
}
