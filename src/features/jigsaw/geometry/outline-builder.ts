import { reverseEdgeSegments } from './bezier';
import {
  outerBottom,
  outerLeft,
  outerRight,
  outerTop,
  type GridMetrics,
} from './edge-generator';
import type { Edge, EdgeRegistry, EdgeSegment } from './types';

function appendSegments(outline: EdgeSegment[], segments: EdgeSegment[]): void {
  for (const seg of segments) {
    outline.push(seg);
  }
}

export function buildPieceOutline(
  row: number,
  col: number,
  rows: number,
  cols: number,
  registry: EdgeRegistry,
  metrics: GridMetrics,
): { outline: EdgeSegment[]; edges: { top: Edge; right: Edge; bottom: Edge; left: Edge } } {
  const top =
    row === 0 ? outerTop(row, col, metrics) : registry.horizontal[row - 1][col];
  const right =
    col === cols - 1 ? outerRight(row, col, metrics) : registry.vertical[row][col];
  const bottom =
    row === rows - 1 ? outerBottom(row, col, metrics) : registry.horizontal[row][col];
  const left =
    col === 0 ? outerLeft(row, col, metrics) : registry.vertical[row][col - 1];

  const outline: EdgeSegment[] = [];
  appendSegments(outline, top.segments);
  appendSegments(outline, right.segments);
  appendSegments(outline, reverseEdgeSegments(bottom.segments));
  appendSegments(outline, reverseEdgeSegments(left.segments));

  return { outline, edges: { top, right, bottom, left } };
}
