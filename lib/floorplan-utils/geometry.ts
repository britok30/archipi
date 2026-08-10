import { toFixedFloat, fAbs } from "./math";
import { EPSILON } from "./constants";

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  a: number;
  b: number;
  c: number;
}

// ============================================================================
// Vertex comparison and ordering
// ============================================================================

export function compareVertices(v0: Point, v1: Point): number {
  return v0.x === v1.x ? v0.y - v1.y : v0.x - v1.x;
}

export function orderVertices<T extends Point>(vertices: T[]): T[] {
  return vertices.sort(compareVertices);
}

// ============================================================================
// Distance functions
// ============================================================================

/** Determines the distance between two points */
export const pointsDistance = (x0: number, y0: number, x1: number, y1: number): number =>
  Math.hypot(x1 - x0, y1 - y0);

export function verticesDistance(v1: Point, v2: Point): number {
  let { x: x0, y: y0 } = v1;
  let { x: x1, y: y1 } = v2;

  return pointsDistance(x0, y0, x1, y1);
}

// ============================================================================
// Line equations (ax + by + c = 0)
// ============================================================================

export function horizontalLine(y: number): Line {
  return { a: 0, b: 1, c: -y };
}

export function verticalLine(x: number): Line {
  return { a: 1, b: 0, c: -x };
}

// ============================================================================
// Line intersections
// ============================================================================

/** Get point of intersection between two lines using ax+by+c line's equation */
export function twoLinesIntersection(
  a: number, b: number, c: number,
  j: number, k: number, l: number
): Point | undefined {
  let angularCoefficientsDiff = b * j - a * k;

  if (angularCoefficientsDiff === 0) return undefined; //no intersection

  let y = (a * l - c * j) / angularCoefficientsDiff;
  let x = (c * k - b * l) / angularCoefficientsDiff;
  return { x, y };
}

// ============================================================================
// Position and mapping
// ============================================================================

export function pointPositionOnLineSegment(
  x1: number, y1: number, x2: number, y2: number, xp: number, yp: number
): number {
  let length = pointsDistance(x1, y1, x2, y2);
  if (length === 0) return 0;
  let distance = pointsDistance(x1, y1, xp, yp);

  let offset = distance / length;
  if (x1 > x2) offset = mapRange(offset, 0, 1, 1, 0);

  return offset;
}

function mapRange(value: number, low1: number, high1: number, low2: number, high2: number): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// ============================================================================
// Angle functions
// ============================================================================

export function angleBetweenTwoPointsAndOrigin(x1: number, y1: number, x2: number, y2: number): number {
  return (-Math.atan2(y1 - y2, x2 - x1) * 180) / Math.PI;
}

export function angleBetweenTwoPoints(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function samePoints({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean {
  return fAbs(x1 - x2) <= EPSILON && fAbs(y1 - y2) <= EPSILON;
}

// ============================================================================
// Line extension and vertex rounding
// ============================================================================

/** Extend line based on coordinates and new line length */
export function extendLine(
  x1: number, y1: number, x2: number, y2: number, newDistance: number, precision: number = 6
): Point {
  let rad = angleBetweenTwoPoints(x1, y1, x2, y2);

  return {
    x: toFixedFloat(x1 + Math.cos(rad) * newDistance, precision),
    y: toFixedFloat(y1 + Math.sin(rad) * newDistance, precision),
  };
}

// ============================================================================
// Polygon containment (from PolyK)
// ============================================================================

//https://github.com/MartyWallace/PolyK
export function ContainsPoint(polygon: number[], pointX: number, pointY: number): boolean {
  let n = polygon.length >> 1;

  let ax: number, lup = false;
  let ay = polygon[2 * n - 3] - pointY;
  let bx = polygon[2 * n - 2] - pointX;
  let by = polygon[2 * n - 1] - pointY;

  if (bx === 0 && by === 0) return false; // point on edge

  // let lup = by > ay;
  for (let ii = 0; ii < n; ii++) {
    ax = bx;
    ay = by;
    bx = polygon[2 * ii] - pointX;
    by = polygon[2 * ii + 1] - pointY;
    if (bx === 0 && by === 0) return false; // point on edge
    if (ay === by) continue;
    lup = by > ay;
  }

  let depth = 0;
  for (let i = 0; i < n; i++) {
    ax = bx;
    ay = by;
    bx = polygon[2 * i] - pointX;
    by = polygon[2 * i + 1] - pointY;
    if (ay < 0 && by < 0) continue; // both 'up' or both 'down'
    if (ay > 0 && by > 0) continue; // both 'up' or both 'down'
    if (ax < 0 && bx < 0) continue; // both points on the left

    if (ay === by && Math.min(ax, bx) < 0) return true;
    if (ay === by) continue;

    let lx = ax + ((bx - ax) * -ay) / (by - ay);
    if (lx === 0) return false; // point on edge
    if (lx > 0) depth++;
    if (ay === 0 && lup && by > ay) depth--; // hit vertex, both up
    if (ay === 0 && !lup && by < ay) depth--; // hit vertex, both down
    lup = by > ay;
  }
  return (depth & 1) === 1;
}

