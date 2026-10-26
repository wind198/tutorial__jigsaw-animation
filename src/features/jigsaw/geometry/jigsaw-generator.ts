import type { PuzzleConfig } from '../config/puzzle-config';
import { validatePuzzleConfig } from '../config/puzzle-config';
import { boundsFromOutline } from './bounds';
import { createEdgeRegistry, type GridMetrics } from './edge-generator';
import { buildPieceOutline } from './outline-builder';
import type { PieceGeometry, PuzzleGeometry } from './types';
import { validatePuzzleGeometry } from './validator';

export function generatePuzzleGeometry(config: PuzzleConfig): PuzzleGeometry {
  validatePuzzleConfig(config);
  const { rows, cols, boardWidth, boardHeight, seed, shape, rendering } = config;

  const cellW = boardWidth / cols;
  const cellH = boardHeight / rows;
  const metrics: GridMetrics = { cellW, cellH, boardWidth, boardHeight };

  const registry = createEdgeRegistry(rows, cols, metrics, shape, seed);

  const pieces: PieceGeometry[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const { outline, edges } = buildPieceOutline(row, col, rows, cols, registry, metrics);
      const bounds = boundsFromOutline(outline, rendering.padding);
      pieces.push({
        id: pieces.length,
        row,
        col,
        outline,
        bounds,
        edges,
        /** World snap aligns container pivot with texture center (see PuzzlePieceView). */
        targetX: bounds.x + bounds.width / 2,
        targetY: bounds.y + bounds.height / 2,
      });
    }
  }

  const geometry: PuzzleGeometry = {
    rows,
    cols,
    boardWidth,
    boardHeight,
    pieces,
    registry,
  };

  validatePuzzleGeometry(geometry);
  return geometry;
}
