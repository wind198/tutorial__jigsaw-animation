export type Point = { x: number; y: number };

export type CubicBezier = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
};

export type EdgeSegment =
  | { kind: 'line'; p0: Point; p1: Point }
  | { kind: 'cubic'; curve: CubicBezier };

export type EdgeKind = 'outer' | 'internal';

export type Edge = {
  id: string;
  kind: EdgeKind;
  start: Point;
  end: Point;
  segments: EdgeSegment[];
  polarity: -1 | 0 | 1;
};

export type EdgeRegistry = {
  horizontal: Edge[][];
  vertical: Edge[][];
};

export type ShapeParams = {
  tabWidthRatio: number;
  tabDepthRatio: number;
  neckWidthRatio: number;
  neckDepthRatio: number;
  bulbWidthRatio: number;
  bulbDepthRatio: number;
  shapeVariation: number;
};

export type PieceGeometry = {
  id: number;
  row: number;
  col: number;
  outline: EdgeSegment[];
  bounds: { x: number; y: number; width: number; height: number };
  edges: { top: Edge; right: Edge; bottom: Edge; left: Edge };
  targetX: number;
  targetY: number;
};

export type PuzzleGeometry = {
  rows: number;
  cols: number;
  boardWidth: number;
  boardHeight: number;
  pieces: PieceGeometry[];
  registry: EdgeRegistry;
};
