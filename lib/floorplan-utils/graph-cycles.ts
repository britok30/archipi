/**
 * UTILS
 */

type Vertex = number[];
type EdgePair = number[];

interface EVMapping {
  ev: EdgePair;
  color: number;
  direction: number;
}

interface Incidence {
  index: number;
  endpoint: number;
  angle: number;
  edge: EdgePair;
  position: number;
}

interface StartingEdge {
  edge: number;
  direction: number;
  position: number;
}

interface NextEdge {
  edge: number;
  vertex: number;
  position: number;
  direction: number;
}

interface CyclesResult {
  v_cycles: number[][];
  e_cycles: number[][];
  dir_e_cycles: number[][];
  ev_mapping: EVMapping[];
}

interface InnerCyclesResult {
  v_cycles: number[][];
  e_cycles: number[][];
  ev_mapping: EVMapping[];
}

function sub(v1: number[], v2: number[]): number[] {
  return [v1[0] - v2[0], v1[1] - v2[1]];
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * CYCLES
 */

function compute_ev_mapping(EV: EdgePair[]): EVMapping[] {
  let ev_mapping = EV.map(function (ev) {
    return {
      ev: ev,
      color: 0,
      direction: -1,
    };
  });

  return ev_mapping;
}

function compute_angle(P: Vertex, V: Vertex): number {
  let point = sub(V, P);
  let angle = Math.atan2(point[1], point[0]);
  return angle;
}

function compute_incidences(V: Vertex[], EV: EdgePair[]): Incidence[][] {
  let incidences = V.map(function (vertex, i) {
    let incidence: Incidence[] = [];
    EV.forEach(function (edge, j) {
      let endpoint: number | undefined;
      let position: number | undefined;

      if (edge[0] === i) {
        endpoint = edge[1];
        position = 1;
      }

      if (edge[1] === i) {
        endpoint = edge[0];
        position = 0;
      }

      endpoint !== undefined &&
        incidence.push({
          index: j,
          endpoint: endpoint,
          angle: compute_angle(vertex, V[endpoint]),
          edge: edge,
          position: position!,
        });
    });

    incidence.sort(function (i1, i2) {
      return i2.angle - i1.angle;
    });

    return incidence;
  });

  return incidences;
}

function get_starting_edge(
  incidences: Incidence[][],
  ev_mapping: EVMapping[]
): StartingEdge | undefined {
  let e: number;
  let direction: number;
  for (e = 0; e < ev_mapping.length; e += 1) {
    if (ev_mapping[e].color < 2) {
      direction = -1 * ev_mapping[e].direction;
      color(ev_mapping, e, direction);
      return {
        edge: e,
        direction: direction,
        position: direction === -1 ? 0 : 1,
      };
    }
  }
  return undefined;
}

function get_next_edge(
  incidences: Incidence[][],
  edge: number,
  position: number,
  EV: EdgePair[]
): NextEdge {
  let items = incidences[EV[edge][position]];
  let n_items = items.length;
  let item: Incidence;
  let out: Incidence;
  let j: number;
  for (j = 0; j < n_items; j += 1) {
    item = items[j];
    if (item.index === edge) {
      out = items[mod(j + 1, items.length)];
      return {
        edge: out.index,
        vertex: out.endpoint,
        position: out.position,
        direction: out.position ? 1 : -1,
      };
    }
  }
  // Should never reach here if input is valid
  throw new Error("Could not find next edge");
}

function color(ev_mapping: EVMapping[], index: number, direction: number): void {
  ev_mapping[index].color += 1;
  ev_mapping[index].direction = direction;
}

function find_cycles(V: Vertex[], EV: EdgePair[]): CyclesResult {
  let ev_mapping = compute_ev_mapping(EV);
  let incidences = compute_incidences(V, EV);
  let V_cycles: number[][] = [];
  let E_cycles: number[][] = [];
  let dir_E_cycles: number[][] = [];
  let V_cycle: number[];
  let E_cycle: number[];
  let dir_E_cycle: number[];
  let next: NextEdge;
  let counter = 0;
  let start = get_starting_edge(incidences, ev_mapping);

  while (start !== undefined) {
    V_cycle = [
      EV[start.edge][mod(start.position + 1, 2)],
      EV[start.edge][start.position],
    ];
    E_cycle = [start.edge];
    dir_E_cycle = [start.direction];
    next = get_next_edge(incidences, start.edge, start.position, EV);
    while (next.edge !== start.edge) {
      V_cycle.push(next.vertex);
      E_cycle.push(next.edge);
      dir_E_cycle.push(next.direction);
      color(ev_mapping, next.edge, next.direction);
      next = get_next_edge(incidences, next.edge, next.position, EV);
    }
    E_cycles.push(E_cycle);
    V_cycles.push(V_cycle);
    dir_E_cycles.push(dir_E_cycle);

    start = get_starting_edge(incidences, ev_mapping);
  }

  return {
    v_cycles: V_cycles,
    e_cycles: E_cycles,
    dir_e_cycles: dir_E_cycles,
    ev_mapping: ev_mapping,
  };
}

function find_short_cycles_indexes(
  v_cycles: number[][],
  e_cycles: number[][]
): number[] {
  let indexes: number[] = [];
  let e_cycle: number[];
  let v_cycle: number[];
  let i: number;

  for (i = 0; i < e_cycles.length; i += 1) {
    e_cycle = e_cycles[i];
    v_cycle = v_cycles[i];
    if (e_cycle.length < 3 || v_cycle[0] !== v_cycle[v_cycle.length - 1]) {
      indexes.push(i);
    }
  }

  return indexes;
}

function find_inner_cycles(V: Vertex[], EV: EdgePair[]): InnerCyclesResult {
  let cycles = find_cycles(V, EV);
  let v_cycles = cycles.v_cycles;
  let e_cycles = cycles.e_cycles;
  let short_cycles_indexes = find_short_cycles_indexes(v_cycles, e_cycles);
  short_cycles_indexes.forEach((indx) => {
    v_cycles.splice(indx, 1);
    e_cycles.splice(indx, 1);
  });
  let dir_e_cycles = cycles.dir_e_cycles;
  let rooms_values = cycles.e_cycles.map((cycle, i) =>
    cycle.map(function (edge, j) {
      let v1: number;
      let v2: number;

      let dir = dir_e_cycles[i][j] > 0;

      if (dir) {
        v1 = EV[edge][0];
        v2 = EV[edge][1];
      } else {
        v1 = EV[edge][1];
        v2 = EV[edge][0];
      }

      return (V[v2][0] - V[v1][0]) * (V[v2][1] + V[v1][1]);
    })
  );

  let rooms_sums = rooms_values.map((room) => room.reduce((a, b) => a + b));

  let positive_count = rooms_sums.filter((sum) => sum > 0).length;
  let negative_count = rooms_sums.length - positive_count;

  let rm_neg = positive_count >= negative_count ? 1 : -1;

  return {
    v_cycles: cycles.v_cycles.filter((v, i) => rm_neg * rooms_sums[i] > 0),
    e_cycles: cycles.e_cycles.filter((v, i) => rm_neg * rooms_sums[i] > 0),
    ev_mapping: cycles.ev_mapping,
  };
}

export default find_inner_cycles;
