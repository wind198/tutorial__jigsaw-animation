import type { PuzzleConfig } from './puzzle-config';
import { DEFAULT_PUZZLE_CONFIG, DEFAULT_SHAPE } from './puzzle-config';
import type { ShapeParams } from '../geometry/types';

export type DifficultyPreset = 'easy' | 'classic' | 'hard';

const PRESET_SHAPES: Record<DifficultyPreset, ShapeParams> = {
  easy: {
    ...DEFAULT_SHAPE,
    tabDepthRatio: 0.14,
    bulbDepthRatio: 0.16,
    shapeVariation: 0.03,
  },
  classic: DEFAULT_SHAPE,
  hard: {
    ...DEFAULT_SHAPE,
    tabWidthRatio: 0.18,
    tabDepthRatio: 0.22,
    neckWidthRatio: 0.1,
    bulbDepthRatio: 0.24,
    shapeVariation: 0.1,
  },
};

export function puzzleConfigFromPreset(
  preset: DifficultyPreset,
  rows: number,
  cols: number,
  boardWidth: number,
  boardHeight: number,
  seed: string | number = DEFAULT_PUZZLE_CONFIG.seed,
): PuzzleConfig {
  return {
    rows,
    cols,
    boardWidth,
    boardHeight,
    seed,
    shape: { ...PRESET_SHAPES[preset] },
    rendering: { ...DEFAULT_PUZZLE_CONFIG.rendering },
  };
}
