import { describe, it, expect } from 'vitest';
import { calculateInnerCycles, isClockWiseOrder } from '@/lib/floorplan-utils/graph-inner-cycles';

/**
 * Canonical, rotation- and direction-invariant form of a cycle so that
 * [0,1,2,3], [1,2,3,0] and [3,2,1,0] all compare equal.
 */
function normCycle(cycle: number[]): string {
  const n = cycle.length;
  let best: string | null = null;
  for (const arr of [cycle, [...cycle].reverse()]) {
    for (let s = 0; s < n; s++) {
      const rot = arr.slice(s).concat(arr.slice(0, s)).join(',');
      if (best === null || rot < best) best = rot;
    }
  }
  return best!;
}

/**
 * Run cycle detection the same way the store's areaDetection does: self-loop
 * and malformed edges are filtered out before calling calculateInnerCycles.
 */
function cycles(vertices: number[][], edges: number[][]): string[] {
  const filtered = edges.filter(
    (e) => e.length === 2 && e[0] !== undefined && e[1] !== undefined && e[0] !== e[1]
  );
  return calculateInnerCycles(vertices, filtered)
    .map(normCycle)
    .sort();
}

function expected(...cyclesList: number[][]): string[] {
  return cyclesList.map(normCycle).sort();
}

const square = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

describe('calculateInnerCycles', () => {
  it('detects a single square room', () => {
    const got = cycles(square, [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3]));
  });

  it('detects two adjacent rooms sharing a wall', () => {
    // 0(0,0) 1(100,0) 2(100,100) 3(0,100) 4(200,0) 5(200,100)
    const V = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
      [200, 0],
      [200, 100],
    ];
    const got = cycles(V, [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [1, 4],
      [4, 5],
      [5, 2],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3], [1, 4, 5, 2]));
  });

  it('detects a nested room (room inside a room)', () => {
    const V = [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300],
      [100, 100],
      [200, 100],
      [200, 200],
      [100, 200],
    ];
    const got = cycles(V, [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3], [4, 5, 6, 7]));
  });

  const dangleV = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
    [200, 50],
  ];

  it('ignores a dangling wall listed FIRST in the edge list', () => {
    const got = cycles(dangleV, [
      [1, 4],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3]));
  });

  it('ignores a dangling wall listed LAST in the edge list', () => {
    const got = cycles(dangleV, [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [1, 4],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3]));
  });

  it('tolerates a duplicate edge between two vertices', () => {
    const got = cycles(square, [
      [0, 1],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3]));
  });

  it('ignores a self-loop edge alongside a room', () => {
    const got = cycles(square, [
      [0, 0], // self-loop, filtered like areaDetection does
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
    expect(got).toEqual(expected([0, 1, 2, 3]));
  });

  it('returns no cycles for a self-loop-only graph', () => {
    const got = cycles(square, [[2, 2]]);
    expect(got).toEqual([]);
  });

  it('detects both rooms of a figure-eight (two rooms sharing one vertex)', () => {
    // Two triangles joined at vertex 1
    const V = [
      [0, 0],
      [100, 0],
      [50, 100],
      [200, 0],
      [150, 100],
    ];
    const got = cycles(V, [
      [0, 1],
      [1, 2],
      [2, 0],
      [1, 3],
      [3, 4],
      [4, 1],
    ]);
    expect(got).toEqual(expected([0, 1, 2], [1, 3, 4]));
  });
});

describe('isClockWiseOrder', () => {
  it('classifies winding direction of a polygon', () => {
    const ccwInScreenCoords = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const reversed = [...ccwInScreenCoords].reverse();
    // The two windings must classify differently
    expect(isClockWiseOrder(ccwInScreenCoords)).not.toBe(isClockWiseOrder(reversed));
  });
});
