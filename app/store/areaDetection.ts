import {
  calculateInnerCycles,
  isClockWiseOrder,
} from "../../lib/floorplan-utils/graph-inner-cycles";
import { ContainsPoint } from "../../lib/floorplan-utils/geometry";
import { Layer, Area } from "./types";
import { generateId, generateName } from "./usePlannerStore";

// Compare two arrays as sets (order-independent)
function sameSet(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

interface AreaDetectionResult {
  updatedLayer: Layer;
}

export function detectAndUpdateAreas(
  layer: Layer,
  catalogElements: Record<
    string,
    { properties: Record<string, { defaultValue: unknown }> }
  >,
): AreaDetectionResult {
  const verticesArray: number[][] = [];
  const vertexID_to_verticesArrayIndex: Record<string, number> = {};
  const verticesArrayIndex_to_vertexID: Record<number, string> = {};

  // Build vertex arrays
  Object.values(layer.vertices).forEach((vertex) => {
    const verticesCount = verticesArray.push([vertex.x, vertex.y]);
    const latestVertexIndex = verticesCount - 1;
    vertexID_to_verticesArrayIndex[vertex.id] = latestVertexIndex;
    verticesArrayIndex_to_vertexID[latestVertexIndex] = vertex.id;
  });

  // Build edges array from lines
  const linesArray: number[][] = Object.values(layer.lines)
    .map((line) =>
      line.vertices.map((vertexID) => vertexID_to_verticesArrayIndex[vertexID]),
    )
    .filter(
      (arr) => arr.length === 2 && arr[0] !== undefined && arr[1] !== undefined,
    );

  // Calculate inner cycles (closed polygons)
  const innerCyclesByVerticesArrayIndex = calculateInnerCycles(
    verticesArray,
    linesArray,
  );

  // Convert array indices back to vertex IDs
  let innerCyclesByVerticesID: string[][] = innerCyclesByVerticesArrayIndex.map(
    (cycle) =>
      cycle.map((vertexIndex) => verticesArrayIndex_to_vertexID[vertexIndex]),
  );

  // All area vertices should be ordered in counterclockwise order
  innerCyclesByVerticesID = innerCyclesByVerticesID.map((areaVertexIds) => {
    const coords = areaVertexIds
      .map((vertexID) => layer.vertices[vertexID])
      .filter(Boolean);
    if (coords.length === 0) return areaVertexIds;
    return isClockWiseOrder(coords)
      ? [...areaVertexIds].reverse()
      : areaVertexIds;
  });

  // Remove areas that are no longer valid cycles
  Object.values(layer.areas).forEach((area) => {
    const areaInUse = innerCyclesByVerticesID.some((vertices) =>
      sameSet(vertices, area.vertices),
    );
    if (!areaInUse) {
      // Remove area
      delete layer.areas[area.id];
      // Remove area reference from vertices
      area.vertices.forEach((vertexId) => {
        const vertex = layer.vertices[vertexId];
        if (vertex) {
          vertex.areas = vertex.areas.filter((id) => id !== area.id);
        }
      });
    }
  });

  // Track area IDs for hole detection
  const areaIDs: string[] = [];

  // Add new areas or update existing ones
  innerCyclesByVerticesID.forEach((cycle, ind) => {
    // Check if this cycle already exists as an area
    const existingArea = Object.values(layer.areas).find((area) =>
      sameSet(area.vertices, cycle),
    );

    if (existingArea) {
      areaIDs[ind] = existingArea.id;
      // Reset holes - will be recalculated
      existingArea.holes = [];
    } else {
      // Create new area
      const areaId = generateId();
      areaIDs[ind] = areaId;

      // Get default properties from catalog
      const catalogElement = catalogElements["area"];
      const properties: Record<string, unknown> = {};
      if (catalogElement) {
        Object.entries(catalogElement.properties).forEach(([key, prop]) => {
          properties[key] = prop.defaultValue;
        });
      }

      const newArea: Area = {
        id: areaId,
        type: "area",
        prototype: "areas",
        name: generateName("areas", "area"),
        vertices: cycle,
        holes: [],
        misc: {},
        selected: false,
        properties,
        visible: true,
      };

      layer.areas[areaId] = newArea;

      // Add area reference to vertices
      cycle.forEach((vertexId) => {
        const vertex = layer.vertices[vertexId];
        if (vertex && !vertex.areas.includes(areaId)) {
          vertex.areas.push(areaId);
        }
      });
    }
  });

  // Build relationship between areas and their coordinates for hole detection
  const verticesCoordsForArea = areaIDs.map((id) => {
    const area = layer.areas[id];
    if (!area) return { id, vertices: [] as number[][] };

    const vertices = area.vertices
      .map((vertexID) => {
        const v = layer.vertices[vertexID];
        return v ? [v.x, v.y] : null;
      })
      .filter((v): v is number[] => v !== null);

    return { id, vertices };
  });

  // Find all holes for each area
  for (let i = 0; i < verticesCoordsForArea.length; i++) {
    const holesList: string[] = [];
    const areaVerticesList = verticesCoordsForArea[i].vertices.flat();

    for (let j = 0; j < verticesCoordsForArea.length; j++) {
      if (i !== j && verticesCoordsForArea[j].vertices.length > 0) {
        const isHole = ContainsPoint(
          areaVerticesList,
          verticesCoordsForArea[j].vertices[0][0],
          verticesCoordsForArea[j].vertices[0][1],
        );
        if (isHole) {
          holesList.push(verticesCoordsForArea[j].id);
        }
      }
    }

    const area = layer.areas[verticesCoordsForArea[i].id];
    if (area) {
      area.holes = holesList;
    }
  }

  // Remove holes which are already holes for other areas (nested holes)
  areaIDs.forEach((areaID) => {
    const area = layer.areas[areaID];
    if (!area) return;

    const doubleHoles = new Set<string>();
    area.holes.forEach((areaHoleID) => {
      const holeArea = layer.areas[areaHoleID];
      if (holeArea) {
        holeArea.holes.forEach((nestedHoleID) => {
          doubleHoles.add(nestedHoleID);
        });
      }
    });

    area.holes = area.holes.filter((holeID) => !doubleHoles.has(holeID));
  });

  return { updatedLayer: layer };
}
