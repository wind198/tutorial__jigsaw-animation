import puzzleSourceUrl from '../../../../assets/puzzle-source.png';

/** Square raster size for piece clipping (board image is scaled to this). */
export const PUZZLE_SOURCE_SIZE = 600;

export { puzzleSourceUrl };

export function rasterizePuzzleSource(image: CanvasImageSource): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PUZZLE_SOURCE_SIZE;
  canvas.height = PUZZLE_SOURCE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is required.');
  ctx.drawImage(image, 0, 0, PUZZLE_SOURCE_SIZE, PUZZLE_SOURCE_SIZE);
  return canvas;
}
