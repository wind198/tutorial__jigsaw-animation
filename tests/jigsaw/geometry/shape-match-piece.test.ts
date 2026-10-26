import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PUZZLE_CONFIG } from '../../../src/features/jigsaw/config/puzzle-config';
import { generatePuzzleGeometry } from '../../../src/features/jigsaw/geometry/jigsaw-generator';
import { compareSegmentPaths } from '../../../src/features/jigsaw/geometry/path-compare';
import {
  extractPathDFromSvg,
  outlineToSvgPath,
  parseSvgPathToSegments,
} from '../../../src/features/jigsaw/geometry/svg-path';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/pieces');
const SAMPLE_COUNT = 384;
/** Closed outline: corners are exact; allow slightly higher error at tab joins. */
const MAX_PX = 4;
const RMS_PX = 2.5;

describe('shape-match center piece (3×3 seed 2026)', () => {
  it('center cell outline matches SVG target', () => {
    const svg = readFileSync(join(FIXTURE_DIR, 'center-3x3-target.svg'), 'utf8');
    const target = parseSvgPathToSegments(extractPathDFromSvg(svg));

    const g = generatePuzzleGeometry({
      rows: 3,
      cols: 3,
      boardWidth: 300,
      boardHeight: 300,
      ...DEFAULT_PUZZLE_CONFIG,
      seed: 2026,
    });
    const piece = g.pieces.find((p) => p.row === 1 && p.col === 1)!;
    const { maxDistance, rmsDistance } = compareSegmentPaths(target, piece.outline, SAMPLE_COUNT);
    const generatedD = outlineToSvgPath(piece.outline, true);
    expect(
      maxDistance,
      `max ${maxDistance.toFixed(3)} rms ${rmsDistance.toFixed(3)}. Generated d=\n${generatedD}`,
    ).toBeLessThanOrEqual(MAX_PX);
    expect(rmsDistance).toBeLessThanOrEqual(RMS_PX);
  });
});
