import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SHAPE } from '../../../src/features/jigsaw/config/puzzle-config';
import { buildEdgeProfile } from '../../../src/features/jigsaw/geometry/edge-profile';
import { compareSegmentPaths } from '../../../src/features/jigsaw/geometry/path-compare';
import {
  extractPathDFromSvg,
  outlineToSvgPath,
  parseSvgPathToSegments,
  translateSegmentsToOrigin,
} from '../../../src/features/jigsaw/geometry/svg-path';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/edges');
const SAMPLE_COUNT = 256;
const MAX_PX = 2;
const RMS_PX = 1.2;

function loadTargetSegments(filename: string) {
  const svg = readFileSync(join(FIXTURE_DIR, filename), 'utf8');
  const d = extractPathDFromSvg(svg);
  return translateSegmentsToOrigin(parseSvgPathToSegments(d));
}

function assertMatchesFixture(
  label: string,
  start: { x: number; y: number },
  end: { x: number; y: number },
  fixtureFile: string,
) {
  const target = loadTargetSegments(fixtureFile);
  const generated = buildEdgeProfile(start, end, 1, DEFAULT_SHAPE, 0.5);
  const { maxDistance, rmsDistance } = compareSegmentPaths(target, generated, SAMPLE_COUNT);
  const generatedD = outlineToSvgPath(generated);
  expect(
    maxDistance,
    `${label}: max ${maxDistance.toFixed(3)}px (rms ${rmsDistance.toFixed(3)}). Generated d=\n${generatedD}`,
  ).toBeLessThanOrEqual(MAX_PX);
  expect(rmsDistance, `${label} rms`).toBeLessThanOrEqual(RMS_PX);
}

describe('shape-match edge fixtures', () => {
  it('horizontal tab matches SVG target', () => {
    assertMatchesFixture('horizontal', { x: 0, y: 0 }, { x: 100, y: 0 }, 'horizontal-tab-target.svg');
  });

  it('vertical tab matches SVG target', () => {
    assertMatchesFixture('vertical', { x: 0, y: 0 }, { x: 0, y: 100 }, 'vertical-tab-target.svg');
  });
});
