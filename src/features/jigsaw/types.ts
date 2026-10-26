/** How a piece is treated for input, motion, and placement in the current turn. */
export type PieceState =
  /** Side tray; draggable. */
  | 'resting'
  /** Following the pointer after pick-up. */
  | 'dragging'
  /** Released off-target; tweening back toward home. */
  | 'dropping'
  /** Released near its slot; tweening onto the board. */
  | 'snapping'
  /** Placed on the board; no longer draggable. */
  | 'locked';
