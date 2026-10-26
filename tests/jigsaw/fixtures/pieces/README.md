# Piece outline fixtures

`center-3x3-target.svg` locks the **(row=1, col=1)** piece for a 3×3 grid at 300×300 board, **seed `2026`**, using tuned `DEFAULT_SHAPE`.

Regenerate after changing edge profile or seed: run `generatePuzzleGeometry` for 3×3 / 300 / seed `2026`, export `outlineToSvgPath(piece.outline, true)` for cell (1,1), and overwrite this file (viewBox from piece bounds + 8px pad).
