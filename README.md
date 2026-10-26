# Little Jigsaw — Phaser + TypeScript

A runnable 3×3 toddler jigsaw MVP. The sample image is generated locally in Canvas, so no remote assets or API keys are required.

## Requirements

- Node.js 20+
- pnpm

## Run

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Production build:

```bash
pnpm build
pnpm preview
```

## Controls

- Mouse or touch: drag any loose piece.
- Release within the snap radius of that piece's own target to place it.
- Release elsewhere to drop it back to its home position.
- Finish all nine pieces and choose **Play again** to restart.

## Architecture

- `src/App.tsx`: React host and Phaser bootstrap.
- `src/game/config.ts`: Phaser game configuration.
- `src/game/scenes/PuzzleScene/`: scene composition, board, HUD, piece views, celebration.
- `src/game/shared/depthPolicy.ts`: display depth constants.
- `src/features/jigsaw/`: puzzle geometry, snap rules, and domain state.
- `tests/jigsaw/`: deterministic feature tests.

See `.cursor/rules/phaser-project-architecture.mdc` for coding conventions.

## Important implementation notes

1. Internal edges are generated once and reused by adjacent cells. This is the basis for complementary tabs/blanks.
2. Piece textures use a shared 600×600 source image, clipped to each piece's `Path2D`.
3. Dragged pieces reparent to `dragLayer`; locked pieces live on `lockedLayer`; tray pieces stay on `pieceLayer`.
4. Snap is position-based and only accepts the piece's own target.
5. The puzzle image is `src/assets/puzzle-source.png` (loaded in `PuzzleScene.preload`, rasterized to 600×600 for piece clipping).

## MVP limitations / next hardening steps

- The layout is tuned for a landscape canvas. For narrow portrait screens, implement a dedicated compact layout with pieces in a tray below the board.
- The current hit area is the piece's rectangular bounds, not its exact jigsaw silhouette. For a toddler game this is forgiving, but a polished release should use a shape-aware hit test or custom polygon.
- Add audio assets, keyboard accessibility, reduced-motion support, and browser/device QA before shipping.
- Add unit tests for edge matching, bounds and piece state transitions. The generator is seeded for repeatable puzzles.
- The source uses browser `Path2D` and Canvas 2D, available in current mainstream browsers.
