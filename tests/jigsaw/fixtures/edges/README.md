# Edge shape fixtures (SVG targets)

## Coordinate contract

| Edge | Start | End | Tab (`polarity: +1`) |
|------|-------|-----|------------------------|
| Horizontal | `(0, 0)` | `(100, 0)` | bulges **+Y** |
| Vertical | `(0, 0)` | `(0, 100)` | bulges **+X** |

Tests call `buildEdgeProfile(..., polarity: 1, variation: 0.5)` so `shapeVariation` does not skew the match.

## ViewBox

- `horizontal-tab-target.svg`: `viewBox="-10 -35 120 70"`
- `vertical-tab-target.svg`: `viewBox="-35 -10 70 120"`

Each file contains a single `<path d="...">` (open chain: `M`, `L`, `C`).

## Replace / re-tune workflow

1. Draw or edit the path in Inkscape/Figma; scale the chord to **100** along the axis; start at **(0,0)** (or rely on test normalization to first point).
2. Save over `horizontal-tab-target.svg` or `vertical-tab-target.svg`.
3. Run `pnpm test tests/jigsaw/geometry/shape-match-edge.test.ts`.
4. Adjust `DEFAULT_SHAPE` in [`puzzle-config.ts`](../../../../src/features/jigsaw/config/puzzle-config.ts) and/or [`edge-profile.ts`](../../../../src/features/jigsaw/geometry/edge-profile.ts) until `maxDistance` is within threshold.
5. On failure, the test prints the generated `d=` string for overlay in an SVG viewer.

Initial committed paths are **design references** (classic knob-neck tab at 100-unit scale). Tight thresholds (~1px) lock the cut to those curves.

## Shape lab (UI)

`pnpm dev` → [http://localhost:5173/#shape-lab](http://localhost:5173/#shape-lab) — shadcn sliders, live SVG preview, copy JSON into `DEFAULT_SHAPE`.
