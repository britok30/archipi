import Graph from './graph';
import getEdgesOfSubgraphs from './get-edges-of-subgraphs';
import graphCycles from './graph-cycles';

export function calculateInnerCycles(
  verticesArray: number[][],
  edgesArray: number[][]
): number[][] {
  const innerCycles: number[][] = [];

  const graph = new Graph(verticesArray.length);
  edgesArray.forEach((line) => {
    graph.addEdge(line[0], line[1]);
    graph.addEdge(line[1], line[0]);
  });

  graph.BCC();

  const subgraphs = graph.subgraphs.filter(
    (subgraph) => subgraph.length >= 3
  );
  const edgesOfSubgraphsArray = getEdgesOfSubgraphs(subgraphs, graph);

  const edges: number[][] = [];
  edgesOfSubgraphsArray.forEach((es: number[][]) => {
    es.forEach((edge) => edges.push(edge));
  });

  const cycles = graphCycles(verticesArray, edges);
  cycles.v_cycles.forEach((cycle: number[]) => {
    cycle.shift();
    innerCycles.push(cycle);
  });

  return innerCycles;
}

interface Vertex {
  x: number;
  y: number;
}

export function isClockWiseOrder(innerCycleWithCoords: Vertex[]): boolean {
  let twiceEnclosedArea = 0;
  const size = innerCycleWithCoords.length;

  for (let i = 0; i < size; i++) {
    const { x: x1, y: y1 } = innerCycleWithCoords[i];
    const { x: x2, y: y2 } = innerCycleWithCoords[(i + 1) % size];
    twiceEnclosedArea += (x2 - x1) * (y2 + y1);
  }

  return twiceEnclosedArea > 0;
}

export default { calculateInnerCycles, isClockWiseOrder };
