import { reverseEdgeSegments, segmentEndPoint, segmentStartPoint, segmentsAreContinuous } from './bezier';
import type { EdgeRegistry, PieceGeometry, PuzzleGeometry } from './types';
import { outlineIsClosed } from './bounds';

function expectEdgeCounts(rows: number, cols: number, registry: EdgeRegistry): void {
  if (registry.horizontal.length !== Math.max(0, rows - 1)) {
    throw new Error('horizontal edge row count mismatch.');
  }
  for (const row of registry.horizontal) {
    if (row.length !== cols) throw new Error('horizontal edge col count mismatch.');
  }
  if (registry.vertical.length !== rows) {
    throw new Error('vertical edge row count mismatch.');
  }
  for (const row of registry.vertical) {
    if (row.length !== Math.max(0, cols - 1)) {
      throw new Error('vertical edge col count mismatch.');
    }
  }
}

export function validatePuzzleGeometry(geometry: PuzzleGeometry): void {
  const { rows, cols, pieces, registry } = geometry;
  expectEdgeCounts(rows, cols, registry);

  if (pieces.length !== rows * cols) {
    throw new Error(`expected ${rows * cols} pieces, got ${pieces.length}.`);
  }

  const byCell = new Map<string, PieceGeometry>();
  for (const p of pieces) {
    byCell.set(`${p.row},${p.col}`, p);
    if (!outlineIsClosed(p.outline)) {
      throw new Error(`piece (${p.row},${p.col}) outline not closed.`);
    }
    if (!segmentsAreContinuous(p.outline, 1)) {
      throw new Error(`piece (${p.row},${p.col}) outline not continuous.`);
    }
  }

  for (const p of pieces) {
    const { row, col } = p;
    if (row > 0) {
      const above = byCell.get(`${row - 1},${col}`)!;
      if (p.edges.top.id !== above.edges.bottom.id) {
        throw new Error(`shared horizontal edge mismatch at (${row},${col}) top.`);
      }
      const rev = reverseEdgeSegments(above.edges.bottom.segments);
      const aEnd = segmentEndPoint(rev[rev.length - 1]);
      const bStart = segmentStartPoint(p.edges.top.segments[0]);
      if (Math.hypot(aEnd.x - bStart.x, aEnd.y - bStart.y) > 1) {
        throw new Error(`top edge traversal mismatch at (${row},${col}).`);
      }
    }
    if (col > 0) {
      const left = byCell.get(`${row},${col - 1}`)!;
      if (p.edges.left.id !== left.edges.right.id) {
        throw new Error(`shared vertical edge mismatch at (${row},${col}) left.`);
      }
    }
  }
}
