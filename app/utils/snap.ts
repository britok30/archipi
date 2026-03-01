import { List, Record } from "immutable";
import * as Geometry from "./geometry";

// ============================================================================
// Snap type constants
// ============================================================================

export const SNAP_POINT = "SNAP_POINT";
export const SNAP_LINE = "SNAP_LINE";
export const SNAP_SEGMENT = "SNAP_SEGMENT";
export const SNAP_GRID = "SNAP_GRID";
export const SNAP_GUIDE = "SNAP_GUIDE";

export type SnapType = "point" | "line" | "line-segment" | "grid";

export interface SnapMaskType {
  SNAP_POINT: boolean;
  SNAP_LINE: boolean;
  SNAP_SEGMENT: boolean;
  SNAP_GRID: boolean;
  SNAP_GUIDE: boolean;
  [key: string]: boolean;
}

export const SNAP_MASK: SnapMaskType = {
  SNAP_POINT: true,
  SNAP_LINE: true,
  SNAP_SEGMENT: true,
  SNAP_GRID: true,
  SNAP_GUIDE: true,
};

// ============================================================================
// Nearest point result
// ============================================================================

export interface NearestPointResult {
  x: number;
  y: number;
  distance: number;
}

// ============================================================================
// Snap element interface (common shape)
// ============================================================================

export interface SnapElementLike {
  type: SnapType;
  radius: number;
  priority: number;
  related: List<unknown>;
  nearestPoint(x: number, y: number): NearestPointResult;
  isNear(x: number, y: number, distance: number): boolean;
}

// ============================================================================
// Snap result
// ============================================================================

export interface SnapResult {
  snap: SnapElementLike;
  point: NearestPointResult;
}

// ============================================================================
// Snap classes (Immutable Records)
// ============================================================================

const PointSnapDefaults = {
  type: "point" as SnapType,
  x: -1,
  y: -1,
  radius: 1,
  priority: 1,
  related: List() as List<unknown>,
};

const PointSnapFactory: any = Record(PointSnapDefaults);
class PointSnap extends PointSnapFactory {
  declare type: SnapType;
  declare x: number;
  declare y: number;
  declare radius: number;
  declare priority: number;
  declare related: List<unknown>;

  constructor(values?: Partial<typeof PointSnapDefaults>) { super(values); }

  nearestPoint(x: number, y: number): NearestPointResult {
    return {
      x: this.x,
      y: this.y,
      distance: Geometry.pointsDistance(this.x, this.y, x, y),
    };
  }
  isNear(x: number, y: number, distance: number): boolean {
    return ~(this.x - x) + 1 < distance && ~(this.y - y) + 1 < distance;
  }
}

const LineSnapDefaults = {
  type: "line" as SnapType,
  a: -1,
  b: -1,
  c: -1,
  radius: 1,
  priority: 1,
  related: List() as List<unknown>,
};

const LineSnapFactory: any = Record(LineSnapDefaults);
class LineSnap extends LineSnapFactory {
  declare type: SnapType;
  declare a: number;
  declare b: number;
  declare c: number;
  declare radius: number;
  declare priority: number;
  declare related: List<unknown>;

  constructor(values?: Partial<typeof LineSnapDefaults>) { super(values); }

  nearestPoint(x: number, y: number): NearestPointResult {
    return {
      ...Geometry.closestPointFromLine(this.a, this.b, this.c, x, y),
      distance: Geometry.distancePointFromLine(this.a, this.b, this.c, x, y),
    };
  }
  isNear(_x: number, _y: number, _distance: number): boolean {
    return true;
  }
}

const LineSegmentSnapDefaults = {
  type: "line-segment" as SnapType,
  x1: -1,
  y1: -1,
  x2: -1,
  y2: -1,
  radius: 1,
  priority: 1,
  related: List() as List<unknown>,
};

const LineSegmentSnapFactory: any = Record(LineSegmentSnapDefaults);
class LineSegmentSnap extends LineSegmentSnapFactory {
  declare type: SnapType;
  declare x1: number;
  declare y1: number;
  declare x2: number;
  declare y2: number;
  declare radius: number;
  declare priority: number;
  declare related: List<unknown>;

  constructor(values?: Partial<typeof LineSegmentSnapDefaults>) { super(values); }

  nearestPoint(x: number, y: number): NearestPointResult {
    return {
      ...Geometry.closestPointFromLineSegment(
        this.x1,
        this.y1,
        this.x2,
        this.y2,
        x,
        y
      ),
      distance: Geometry.distancePointFromLineSegment(
        this.x1,
        this.y1,
        this.x2,
        this.y2,
        x,
        y
      ),
    };
  }
  isNear(_x: number, _y: number, _distance: number): boolean {
    return true;
  }
}

const GridSnapDefaults = {
  type: "grid" as SnapType,
  x: -1,
  y: -1,
  radius: 1,
  priority: 1,
  related: List() as List<unknown>,
};

const GridSnapFactory: any = Record(GridSnapDefaults);
class GridSnap extends GridSnapFactory {
  declare type: SnapType;
  declare x: number;
  declare y: number;
  declare radius: number;
  declare priority: number;
  declare related: List<unknown>;

  constructor(values?: Partial<typeof GridSnapDefaults>) { super(values); }

  nearestPoint(x: number, y: number): NearestPointResult {
    return {
      x: this.x,
      y: this.y,
      distance: Geometry.pointsDistance(this.x, this.y, x, y),
    };
  }
  isNear(x: number, y: number, distance: number): boolean {
    return ~(this.x - x) + 1 < distance && ~(this.y - y) + 1 < distance;
  }
}

// ============================================================================
// Snap functions
// ============================================================================

export function nearestSnap(
  snapElements: List<SnapElementLike>,
  x: number,
  y: number,
  snapMask: { [key: string]: boolean }
): SnapResult | undefined {
  let filter: { [key: string]: boolean } = {
    point: snapMask[SNAP_POINT],
    line: snapMask[SNAP_LINE],
    "line-segment": snapMask[SNAP_SEGMENT],
    grid: snapMask[SNAP_GRID],
  };

  return (snapElements as any)
    .valueSeq()
    .filter((el: any) => !!el && filter[el.type] && el.isNear(x, y, el.radius))
    .map((snap: any) => {
      return { snap, point: snap.nearestPoint(x, y) };
    })
    .filter((item: any) =>
      !!item && !!item.snap && item.point.distance < item.snap.radius
    )
    .min(
      (a: any, b: any) => {
        const p1 = a.snap.priority, d1 = a.point.distance;
        const p2 = b.snap.priority, d2 = b.point.distance;
        return p1 === p2 ? (d1 < d2 ? -1 : 1) : p1 > p2 ? -1 : 1;
      }
    ) as SnapResult | undefined;
}

export function addPointSnap(
  snapElements: List<SnapElementLike>,
  x: number,
  y: number,
  radius: number,
  priority: number,
  related?: unknown
): List<SnapElementLike> {
  const relatedList = List([related]);
  return snapElements.push(
    new PointSnap({ x, y, radius, priority, related: relatedList }) as unknown as SnapElementLike
  );
}

export function addLineSnap(
  snapElements: List<SnapElementLike>,
  a: number,
  b: number,
  c: number,
  radius: number,
  priority: number,
  related?: unknown
): List<SnapElementLike> {
  const relatedList = List([related]);

  return snapElements.withMutations((snapElements) => {
    let alreadyPresent = snapElements.some(
      (lineSnap) =>
        !!lineSnap && lineSnap.type === "line" &&
        a === (lineSnap as unknown as { a: number }).a &&
        b === (lineSnap as unknown as { b: number }).b &&
        c === (lineSnap as unknown as { c: number }).c
    );
    if (alreadyPresent) return snapElements;

    snapElements
      .valueSeq()
      .filter((snap): snap is SnapElementLike => !!snap && snap.type === "line")
      .map((snap) => {
        const lineSnap = snap as unknown as { a: number; b: number; c: number };
        return Geometry.twoLinesIntersection(lineSnap.a, lineSnap.b, lineSnap.c, a, b, c);
      })
      .filter((intersection): intersection is { x: number; y: number } => intersection !== undefined)
      .forEach((point: any) =>
        addPointSnap(snapElements as unknown as List<SnapElementLike>, point.x, point.y, 20, 40)
      );

    snapElements.push(
      new LineSnap({ a, b, c, radius, priority, related: relatedList }) as unknown as SnapElementLike
    );
  });
}

export function addLineSegmentSnap(
  snapElements: List<SnapElementLike>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  priority: number,
  related?: unknown
): List<SnapElementLike> {
  const relatedList = List([related]);
  return snapElements.push(
    new LineSegmentSnap({ x1, y1, x2, y2, radius, priority, related: relatedList }) as unknown as SnapElementLike
  );
}

export function addGridSnap(
  snapElements: List<SnapElementLike>,
  x: number,
  y: number,
  radius: number,
  priority: number,
  related?: unknown
): List<SnapElementLike> {
  const relatedList = List([related]);
  return snapElements.push(
    new GridSnap({ x, y, radius, priority, related: relatedList }) as unknown as SnapElementLike
  );
}
