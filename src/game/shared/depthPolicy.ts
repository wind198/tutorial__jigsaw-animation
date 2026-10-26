export const SceneDepth = {
  background: -10,
  board: 20,
  locked: 90,
  pieces: 100,
  drag: 200,
  effects: 1100,
  hud: 1200,
} as const;

// calculate the depth of the resting piece
export function restingPieceDepth(index: number): number {
  return SceneDepth.pieces + index;
}
