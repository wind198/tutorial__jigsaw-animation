import { DEFAULT_PUZZLE_CONFIG, type PuzzleConfig } from './config/puzzle-config';
import { puzzleConfigFromPreset, type DifficultyPreset } from './config/presets';
import { generatePuzzleGeometry } from './geometry/jigsaw-generator';
import type { PieceGeometry } from './geometry/types';

export type CreatePuzzleDefinitionsOptions = {
  rows: number;
  cols: number;
  boardWidth: number;
  boardHeight: number;
  seed?: string | number;
  preset?: DifficultyPreset;
  config?: Partial<PuzzleConfig>;
};

export function createPuzzleDefinitions(options: CreatePuzzleDefinitionsOptions): PieceGeometry[] {
  const {
    rows,
    cols,
    boardWidth,
    boardHeight,
    seed = DEFAULT_PUZZLE_CONFIG.seed,
    preset = 'classic',
    config: overrides,
  } = options;

  const base = puzzleConfigFromPreset(preset, rows, cols, boardWidth, boardHeight, seed);
  const config: PuzzleConfig = {
    ...base,
    ...overrides,
    seed: overrides?.seed ?? seed,
    shape: { ...base.shape, ...overrides?.shape },
    rendering: { ...base.rendering, ...overrides?.rendering },
  };

  return generatePuzzleGeometry(config).pieces;
}
