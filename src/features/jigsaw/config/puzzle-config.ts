import type { ShapeParams } from '../geometry/types';

export type PuzzleConfig = {
  rows: number;
  cols: number;
  boardWidth: number;
  boardHeight: number;
  seed: string | number;
  shape: ShapeParams;
  rendering: {
    padding: number;
    outlineWidth: number;
  };
};

/** Tuned in shape lab (#shape-lab). */
export const DEFAULT_SHAPE: ShapeParams = {
  tabWidthRatio: 0.4,
  tabDepthRatio: 0.42,
  neckWidthRatio: 0.505,
  neckDepthRatio: 0.62,
  bulbWidthRatio: 0.2,
  bulbDepthRatio: 0,
  shapeVariation: 0,
};

export const DEFAULT_PUZZLE_CONFIG: Omit<PuzzleConfig, 'rows' | 'cols' | 'boardWidth' | 'boardHeight'> = {
  seed: 2026,
  shape: DEFAULT_SHAPE,
  rendering: { padding: 4, outlineWidth: 2.5 },
};

export function validatePuzzleConfig(config: PuzzleConfig): void {
  const { rows, cols, boardWidth, boardHeight, shape, rendering } = config;
  if (!Number.isInteger(rows) || rows < 1) throw new Error('rows must be a positive integer.');
  if (!Number.isInteger(cols) || cols < 1) throw new Error('cols must be a positive integer.');
  if (!Number.isFinite(boardWidth) || boardWidth <= 0) {
    throw new Error('boardWidth must be a positive finite number.');
  }
  if (!Number.isFinite(boardHeight) || boardHeight <= 0) {
    throw new Error('boardHeight must be a positive finite number.');
  }
  if (rendering.padding < 0) throw new Error('rendering.padding must be non-negative.');
  const ratios: (keyof ShapeParams)[] = [
    'tabWidthRatio',
    'tabDepthRatio',
    'neckWidthRatio',
    'neckDepthRatio',
    'bulbWidthRatio',
    'bulbDepthRatio',
    'shapeVariation',
  ];
  for (const key of ratios) {
    const v = shape[key];
    if (!Number.isFinite(v) || v < 0 || v > 1) {
      throw new Error(`shape.${key} must be between 0 and 1.`);
    }
  }
}
