import { describe, it, expect } from 'vitest';
import { toFixedFloat, fAbs } from '@/lib/floorplan-utils/math';
import {
  pointsDistance,
  verticesDistance,
  pointPositionOnLineSegment,
  ContainsPoint,
  angleBetweenTwoPoints,
  angleBetweenTwoPointsAndOrigin,
  samePoints,
  extendLine,
  twoLinesIntersection,
  horizontalLine,
  verticalLine,
  compareVertices,
  orderVertices,
} from '@/lib/floorplan-utils/geometry';

describe('toFixedFloat', () => {
  it('returns 0 for NaN', () => {
    expect(toFixedFloat(NaN)).toBe(0);
  });

  it('returns 0 for Infinity and -Infinity', () => {
    expect(toFixedFloat(Infinity)).toBe(0);
    expect(toFixedFloat(-Infinity)).toBe(0);
  });

  it('supports precision 0', () => {
    expect(toFixedFloat(123.4, 0)).toBe(123);
    expect(toFixedFloat(123.6, 0)).toBe(124);
  });

  it('rounds normally at default precision (6)', () => {
    expect(toFixedFloat(1.23456789)).toBe(1.234568);
    expect(toFixedFloat(2.5, 1)).toBe(2.5);
    expect(toFixedFloat(-1.0000004)).toBe(-1);
  });
});

describe('fAbs', () => {
  it('is absolute value', () => {
    expect(fAbs(-3)).toBe(3);
    expect(fAbs(3)).toBe(3);
  });
});

describe('pointPositionOnLineSegment', () => {
  it('returns 0 for a zero-length segment', () => {
    expect(pointPositionOnLineSegment(5, 5, 5, 5, 10, 10)).toBe(0);
  });

  it('returns 0.5 at the midpoint', () => {
    expect(pointPositionOnLineSegment(0, 0, 100, 0, 50, 0)).toBeCloseTo(0.5);
    // Reversed direction (x1 > x2) is remapped, midpoint stays 0.5
    expect(pointPositionOnLineSegment(100, 0, 0, 0, 50, 0)).toBeCloseTo(0.5);
  });

  it('returns 0 and 1 at the endpoints', () => {
    expect(pointPositionOnLineSegment(0, 0, 100, 0, 0, 0)).toBeCloseTo(0);
    expect(pointPositionOnLineSegment(0, 0, 100, 0, 100, 0)).toBeCloseTo(1);
  });

  it('returns 0.25 at a quarter along the segment', () => {
    expect(pointPositionOnLineSegment(0, 0, 200, 0, 50, 0)).toBeCloseTo(0.25);
  });
});

describe('ContainsPoint', () => {
  const squarePoly = [0, 0, 100, 0, 100, 100, 0, 100];

  it('returns true for a point inside the polygon', () => {
    expect(ContainsPoint(squarePoly, 50, 50)).toBe(true);
  });

  it('returns false for a point outside the polygon', () => {
    expect(ContainsPoint(squarePoly, 150, 50)).toBe(false);
    expect(ContainsPoint(squarePoly, -10, -10)).toBe(false);
  });

  it('returns false for a point exactly on a polygon vertex (boundary treated as outside)', () => {
    expect(ContainsPoint(squarePoly, 0, 0)).toBe(false);
    expect(ContainsPoint(squarePoly, 100, 100)).toBe(false);
  });

  it('handles a concave polygon', () => {
    // L-shape: big square with top-right quadrant removed
    const lShape = [0, 0, 100, 0, 100, 50, 50, 50, 50, 100, 0, 100];
    expect(ContainsPoint(lShape, 25, 75)).toBe(true); // inside the L
    expect(ContainsPoint(lShape, 75, 75)).toBe(false); // in the notch
  });
});

describe('distance helpers', () => {
  it('pointsDistance computes euclidean distance', () => {
    expect(pointsDistance(0, 0, 3, 4)).toBe(5);
  });

  it('verticesDistance works with Point objects', () => {
    expect(verticesDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(verticesDistance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
});

describe('angle helpers', () => {
  it('angleBetweenTwoPoints returns radians of the direction vector', () => {
    expect(angleBetweenTwoPoints(0, 0, 100, 0)).toBeCloseTo(0);
    expect(angleBetweenTwoPoints(0, 0, 0, 100)).toBeCloseTo(Math.PI / 2);
    expect(angleBetweenTwoPoints(0, 0, -100, 0)).toBeCloseTo(Math.PI);
  });

  it('angleBetweenTwoPointsAndOrigin returns degrees with inverted y', () => {
    expect(angleBetweenTwoPointsAndOrigin(0, 0, 100, 0)).toBeCloseTo(0);
    expect(angleBetweenTwoPointsAndOrigin(0, 100, 100, 0)).toBeCloseTo(-45);
  });
});

describe('samePoints', () => {
  it('treats points within EPSILON as equal', () => {
    expect(samePoints({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(true);
    expect(samePoints({ x: 1, y: 1 }, { x: 1 + 1e-7, y: 1 })).toBe(true); // within EPSILON (1e-6)
    expect(samePoints({ x: 1, y: 1 }, { x: 2, y: 1 })).toBe(false);
  });
});

describe('extendLine', () => {
  it('extends a horizontal line to the requested length', () => {
    expect(extendLine(0, 0, 50, 0, 200)).toEqual({ x: 200, y: 0 });
  });

  it('extends a diagonal line preserving direction', () => {
    const p = extendLine(0, 0, 10, 10, Math.hypot(20, 20));
    expect(p.x).toBeCloseTo(20);
    expect(p.y).toBeCloseTo(20);
  });
});

describe('line equations and intersection', () => {
  it('intersects a horizontal and a vertical line', () => {
    const h = horizontalLine(10);
    const v = verticalLine(20);
    const p = twoLinesIntersection(h.a, h.b, h.c, v.a, v.b, v.c);
    expect(p).toEqual({ x: 20, y: 10 });
  });

  it('returns undefined for parallel lines', () => {
    const h1 = horizontalLine(10);
    const h2 = horizontalLine(20);
    expect(twoLinesIntersection(h1.a, h1.b, h1.c, h2.a, h2.b, h2.c)).toBeUndefined();
  });
});

describe('vertex ordering', () => {
  it('compareVertices orders by x then y', () => {
    expect(compareVertices({ x: 1, y: 5 }, { x: 2, y: 0 })).toBeLessThan(0);
    expect(compareVertices({ x: 1, y: 5 }, { x: 1, y: 2 })).toBeGreaterThan(0);
  });

  it('orderVertices sorts an array of points', () => {
    const sorted = orderVertices([
      { x: 2, y: 0 },
      { x: 1, y: 5 },
      { x: 1, y: 2 },
    ]);
    expect(sorted).toEqual([
      { x: 1, y: 2 },
      { x: 1, y: 5 },
      { x: 2, y: 0 },
    ]);
  });
});
