//JS porting of this code http://www.geeksforgeeks.org/biconnected-components/

function create_array(length) {
  let array = [];
  for (let i = 0; i < length; ++i) {
    array.push([]);
  }
  return array;
}

class Edge {
  constructor(u, v) {
    this.u = u;
    this.v = v;
  }
}

class Graph {
  constructor(v) {
    if (typeof v !== "number" || v < 0) {
      throw new Error("Number of vertices must be a positive number");
    }

    this.count = 0;
    this.subgraphs = [];
    this.time = 0;
    this.V = v;
    this.E = 0;

    // Initialize adjacency list with arrays
    this.adj = Array.from({ length: v }, () => []);
  }

  addEdge(v, w) {
    // Validate vertex indices
    if (typeof v !== "number" || typeof w !== "number") {
      throw new Error("Vertices must be numbers");
    }

    if (v < 0 || w < 0) {
      throw new Error("Vertices must be non-negative");
    }

    if (v >= this.V || w >= this.V) {
      throw new Error(
        `Vertex index out of bounds: ${v}, ${w}. Max index is ${this.V - 1}`
      );
    }

    this.adj[v].push(w);
    this.E++;
  }

  // A recursive function that finds and prints strongly connected
  // components using DFS traversal
  // u --> The vertex to be visited next
  // disc[] --> Stores discovery times of visited vertices
  // low[] -- >> earliest visited vertex (the vertex with minimum
  //             discovery time) that can be reached from subtree
  //             rooted with current vertex
  // *st -- >> To store visited edges
  // // A recursive function that finds and prints strongly connected
  // components using DFS traversal
  // u --> The vertex to be visited next
  // disc[] --> Stores discovery times of visited vertices
  // low[] -- >> earliest visited vertex (the vertex with minimum
  //             discovery time) that can be reached from subtree
  //             rooted with current vertex
  // *st -- >> To store visited edges
  _BCCUtil(u, disc, low, st, parent) {
    // Initialize discovery time and low value
    disc[u] = low[u] = ++this.time;
    this.children = 0;

    // Go through all vertices adjacent to this
    // v is current adjacent of 'u'
    this.adj[u].forEach((v) => {
      // If v is not visited yet, then recur for it
      if (disc[v] === -1) {
        this.children++;
        parent[v] = u;

        // store the edge in stack
        st.push(new Edge(u, v));
        this._BCCUtil(v, disc, low, st, parent);

        // Check if the subtree rooted with 'v' has a
        // connection to one of the ancestors of 'u'
        // Case 1 -- per Strongly Connected Components Article
        if (low[u] > low[v]) low[u] = low[v];

        // If u is an articulation point,
        // pop all edges from stack till u -- v
        if (
          (disc[u] === 1 && this.children > 1) ||
          (disc[u] > 1 && low[v] >= disc[u])
        ) {
          let subgraph = [];
          while (st[st.length - 1].u !== u || st[st.length - 1].v !== v) {
            subgraph.push(st[st.length - 1]);
            //console.log(st[st.length - 1].u + "--" + st[st.length - 1].v + " ");
            st.splice(st.length - 1, 1);
          }

          subgraph.push(st[st.length - 1]);
          //console.log(st[st.length - 1].u + "--" + st[st.length - 1].v + " ");
          this.subgraphs.push(subgraph);
          subgraph = [];
          //console.log()
          st.splice(st.length - 1, 1);

          this.count++;
        }
      }

      // Update low value of 'u' only of 'v' is still in stack
      // (i.e. it's a back edge, not cross edge).
      // Case 2 -- per Strongly Connected Components Article
      else if (v !== parent[u] && disc[v] < low[u]) {
        if (low[u] > disc[v]) low[u] = disc[v];
        st.push(new Edge(u, v));
      }
    });
  }

  BCC() {
    let V = this.V;
    let disc = create_array(V);
    let low = create_array(V);
    let parent = create_array(V);
    let st = [];

    // Initialize disc and low, and parent arrays
    for (let i = 0; i < V; i++) {
      disc[i] = -1;
      low[i] = -1;
      parent[i] = -1;
    }

    for (let i = 0; i < V; i++) {
      if (disc[i] === -1) this._BCCUtil(i, disc, low, st, parent);

      let j = 0;

      // If stack is not empty, pop all edges from stack
      let subgraph = [];
      while (st.length > 0) {
        j = 1;
        subgraph.push(st[st.length - 1]);
        //console.log(st[st.length - 1].u + "--" + st[st.length - 1].v + " ");
        st.splice(st.length - 1, 1);
      }

      if (j === 1) {
        this.subgraphs.push(subgraph);
        subgraph = [];
        //console.log();
        this.count++;
      }
    }
  }
}

module.exports = Graph;
