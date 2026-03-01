import type { Edge } from './graph';

interface GraphLike {
  adj: number[][];
}

function getEdgesOfSubgraphs(subgraphs: Edge[][], graph: GraphLike): number[][][] {
  let edges: number[][][] = [];

  subgraphs.forEach((component) => {
    edges.push([]);
    let vertices = getVerticesFromBiconnectedComponent(component);
    vertices.forEach((vertex) => {
      let adjacents = graph.adj[vertex];
      adjacents.forEach((adj) => {
        if (vertex <= adj && vertices.has(adj)) {
          edges[edges.length - 1].push([vertex, adj]);
        }
      });
    });
  });
  return edges;
}

function getVerticesFromBiconnectedComponent(component: Edge[]): Set<number> {
  let vertices = new Set<number>();
  component.forEach((edge) => {
    vertices.add(edge.u);
    vertices.add(edge.v);
  });
  return vertices;
}

export default getEdgesOfSubgraphs;
