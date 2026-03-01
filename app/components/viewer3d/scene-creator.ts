import * as Three from "three";
import createGrid from "./grid-creator";
import type { Scene, Layer, RuntimeCatalog } from "../../store/types";

const MAX_BUSY_RETRIES = 50;

interface SceneGraph {
  unit: string;
  layers: Record<string, {
    id: string;
    lines: Record<string, Three.Object3D>;
    holes: Record<string, Three.Object3D>;
    areas: Record<string, Three.Object3D>;
    items: Record<string, Three.Object3D>;
    visible: boolean;
    altitude: number;
  }>;
  busyResources: {
    layers: Record<string, {
      id: string;
      lines: Record<string, boolean>;
      holes: Record<string, boolean>;
      areas: Record<string, boolean>;
      items: Record<string, boolean>;
    }>;
  };
  width: number;
  height: number;
  LODs: Record<string, Three.LOD>;
}

interface PlanData {
  sceneGraph: SceneGraph;
  plan: Three.Object3D;
  grid: Three.Object3D;
  boundingBox: Three.Box3;
}

interface Actions {
  selectHole: (layerID: string, holeID: string) => void;
  selectLine: (layerID: string, lineID: string) => void;
  selectArea: (layerID: string, areaID: string) => void;
  selectItem: (layerID: string, itemID: string) => void;
}

export function parseData(
  sceneData: Scene,
  actions: Actions,
  catalog: RuntimeCatalog
): PlanData {
  let planData = {} as PlanData;

  planData.sceneGraph = {
    unit: sceneData.unit,
    layers: {},
    busyResources: { layers: {} },
    width: sceneData.width,
    height: sceneData.height,
    LODs: {},
  };

  planData.plan = new Three.Object3D();
  planData.plan.name = "plan";

  // Add a grid to the plan
  planData.grid = createGrid(sceneData);
  planData.grid.name = "grid";

  planData.boundingBox = new Three.Box3().setFromObject(planData.grid);
  (planData.boundingBox as any).name = "boundingBox";

  let promises: (Promise<void> | undefined)[] = [];

  Object.values(sceneData.layers).forEach((layer) => {
    if (layer.id === sceneData.selectedLayer || layer.visible) {
      promises = promises.concat(
        createLayerObjects(layer, planData, sceneData, actions, catalog)
      );
    }
  });

  Promise.all(promises).then((value) => updateBoundingBox(planData));

  return planData;
}

function createLayerObjects(
  layer: Layer,
  planData: PlanData,
  sceneData: Scene,
  actions: Actions,
  catalog: RuntimeCatalog
): (Promise<void> | undefined)[] {
  let promises: (Promise<void> | undefined)[] = [];

  planData.sceneGraph.layers[layer.id] = {
    id: layer.id,
    lines: {},
    holes: {},
    areas: {},
    items: {},
    visible: layer.visible,
    altitude: layer.altitude,
  };

  planData.sceneGraph.busyResources.layers[layer.id] = {
    id: layer.id,
    lines: {},
    holes: {},
    areas: {},
    items: {},
  };

  // Import lines
  Object.values(layer.lines).forEach((line) => {
    promises.push(
      addLine(sceneData, planData, layer, line.id, catalog, actions)
    );
    line.holes.forEach((holeID) => {
      promises.push(
        addHole(sceneData, planData, layer, holeID, catalog, actions)
      );
    });
  });

  // Import areas
  Object.values(layer.areas).forEach((area) => {
    promises.push(
      addArea(sceneData, planData, layer, area.id, catalog, actions)
    );
  });

  // Import items
  Object.values(layer.items).forEach((item) => {
    promises.push(
      addItem(sceneData, planData, layer, item.id, catalog, actions)
    );
  });

  return promises;
}

function addHole(
  sceneData: Scene,
  planData: PlanData,
  layer: Layer,
  holeID: string,
  catalog: RuntimeCatalog,
  actions: Actions
): Promise<void> | undefined {
  let holeData = layer.holes[holeID];

  // Create the hole object
  return catalog
    ?.getElement(holeData.type)
    .render3D!(holeData, layer, sceneData)
    .then((object: any) => {
      if (object instanceof Three.LOD) {
        planData.sceneGraph.LODs[holeID] = object;
      }

      let pivot = new Three.Object3D();
      pivot.name = "pivot";
      pivot.add(object);

      let line = layer.lines[holeData.line];

      // First of all I need to find the vertices of this line
      let vertex0 = layer.vertices[line.vertices[0]];
      let vertex1 = layer.vertices[line.vertices[1]];
      let offset = holeData.offset;

      if (vertex0.x > vertex1.x) {
        let tmp = vertex0;
        vertex0 = vertex1;
        vertex1 = tmp;
        offset = 1 - offset;
      }

      let distance = Math.sqrt(
        Math.pow(vertex0.x - vertex1.x, 2) + Math.pow(vertex0.y - vertex1.y, 2)
      );
      let alpha = Math.asin((vertex1.y - vertex0.y) / distance);

      let boundingBox = new Three.Box3().setFromObject(pivot);
      let center = [
        (boundingBox.max.x - boundingBox.min.x) / 2 + boundingBox.min.x,
        (boundingBox.max.y - boundingBox.min.y) / 2 + boundingBox.min.y,
        (boundingBox.max.z - boundingBox.min.z) / 2 + boundingBox.min.z,
      ];

      let holeAltitude = (holeData.properties as any)?.altitude?.length || 0;
      let holeHeight = (holeData.properties as any)?.height?.length || 0;

      pivot.rotation.y = alpha;
      pivot.position.x =
        vertex0.x +
        distance * offset * Math.cos(alpha) -
        center[2] * Math.sin(alpha);
      pivot.position.y =
        holeAltitude + holeHeight / 2 - center[1] + layer.altitude;
      pivot.position.z =
        -vertex0.y -
        distance * offset * Math.sin(alpha) -
        center[2] * Math.cos(alpha);

      planData.plan.add(pivot);
      planData.sceneGraph.layers[layer.id].holes[holeData.id] = pivot;

      applyInteract(pivot, () => {
        return actions.selectHole(layer.id, holeData.id);
      });

      let opacity = layer.opacity;
      if (holeData.selected) {
        opacity = 1;
      }
      applyOpacity(pivot, opacity);
    });
}

function addLine(
  sceneData: Scene,
  planData: PlanData,
  layer: Layer,
  lineID: string,
  catalog: RuntimeCatalog,
  actions: Actions,
  retryCount: number = 0
): Promise<void> | undefined {
  if (planData.sceneGraph.busyResources.layers[layer.id].lines[lineID]) {
    if (retryCount >= MAX_BUSY_RETRIES) {
      console.warn(`addLine: max retries (${MAX_BUSY_RETRIES}) exceeded for line ${lineID} on layer ${layer.id}`);
      return;
    }
    setTimeout(
      () => addLine(sceneData, planData, layer, lineID, catalog, actions, retryCount + 1),
      100
    );
    return;
  }

  planData.sceneGraph.busyResources.layers[layer.id].lines[lineID] = true;

  let line = layer.lines[lineID];

  // First of all I need to find the vertices of this line
  let vertex0 = layer.vertices[line.vertices[0]];
  let vertex1 = layer.vertices[line.vertices[1]];

  if (vertex0.x > vertex1.x) {
    let tmp = vertex0;
    vertex0 = vertex1;
    vertex1 = tmp;
  }

  return catalog
    ?.getElement(line.type)
    .render3D!(line, layer, sceneData)
    .then((line3D: any) => {
      if (line3D instanceof Three.LOD) {
        planData.sceneGraph.LODs[line.id] = line3D;
      }

      let pivot = new Three.Object3D();
      pivot.name = "pivot";
      pivot.add(line3D);

      pivot.position.x = vertex0.x;
      pivot.position.y = layer.altitude;
      pivot.position.z = -vertex0.y;

      planData.plan.add(pivot);
      planData.sceneGraph.layers[layer.id].lines[lineID] = pivot;

      applyInteract(pivot, () => {
        return actions.selectLine(layer.id, line.id);
      });

      let opacity = layer.opacity;
      if (line.selected) {
        opacity = 1;
      }
      applyOpacity(pivot, opacity);
      planData.sceneGraph.busyResources.layers[layer.id].lines[lineID] = false;
    });
}

function addArea(
  sceneData: Scene,
  planData: PlanData,
  layer: Layer,
  areaID: string,
  catalog: RuntimeCatalog,
  actions: Actions,
  retryCount: number = 0
): Promise<void> | undefined {
  if (planData.sceneGraph.busyResources.layers[layer.id].areas[areaID]) {
    if (retryCount >= MAX_BUSY_RETRIES) {
      console.warn(`addArea: max retries (${MAX_BUSY_RETRIES}) exceeded for area ${areaID} on layer ${layer.id}`);
      return;
    }
    setTimeout(
      () => addArea(sceneData, planData, layer, areaID, catalog, actions, retryCount + 1),
      100
    );
    return;
  }

  planData.sceneGraph.busyResources.layers[layer.id].areas[areaID] = true;

  let area = layer.areas[areaID];
  let interactFunction = () => actions.selectArea(layer.id, areaID);

  return catalog
    ?.getElement(area.type)
    .render3D!(area, layer, sceneData)
    .then((area3D: any) => {
      if (area3D instanceof Three.LOD) {
        planData.sceneGraph.LODs[areaID] = area3D;
      }

      let pivot = new Three.Object3D();
      pivot.name = "pivot";
      pivot.add(area3D);
      pivot.position.y = layer.altitude;
      planData.plan.add(pivot);
      planData.sceneGraph.layers[layer.id].areas[areaID] = pivot;

      applyInteract(pivot, interactFunction);

      let opacity = layer.opacity;
      if (area.selected) {
        opacity = 1;
      }

      applyOpacity(pivot, opacity);
      planData.sceneGraph.busyResources.layers[layer.id].areas[areaID] = false;
    });
}

function addItem(
  sceneData: Scene,
  planData: PlanData,
  layer: Layer,
  itemID: string,
  catalog: RuntimeCatalog,
  actions: Actions
): Promise<void> | undefined {
  let item = layer.items[itemID];

  return catalog
    ?.getElement(item.type)
    .render3D!(item, layer, sceneData)
    .then((item3D: any) => {
      if (item3D instanceof Three.LOD) {
        planData.sceneGraph.LODs[itemID] = item3D;
      }

      let pivot = new Three.Object3D();
      pivot.name = "pivot";
      pivot.add(item3D);

      pivot.rotation.y = (item.rotation * Math.PI) / 180;
      pivot.position.x = item.x;
      pivot.position.y = layer.altitude;
      pivot.position.z = -item.y;

      applyInteract(item3D, () => {
        actions.selectItem(layer.id, item.id);
      });

      let opacity = layer.opacity;
      if (item.selected) {
        opacity = 1;
      }

      applyOpacity(pivot, opacity);

      planData.plan.add(pivot);
      planData.sceneGraph.layers[layer.id].items[item.id] = pivot;
    });
}

// Apply interact function to children of an Object3D
function applyInteract(object: Three.Object3D, interactFunction: () => void): void {
  object.traverse((child) => {
    if (child instanceof Three.Mesh) {
      (child as any).interact = interactFunction;
    }
  });
}

function updateMaterialOpacity(material: Three.Material & { maxOpacity?: number }, opacity: number): void {
  material.transparent = true;
  if (material.maxOpacity) {
    material.opacity = Math.min(material.maxOpacity, opacity);
  } else if (material.opacity && material.opacity > opacity) {
    material.maxOpacity = material.opacity;
    material.opacity = opacity;
  }
}

// Apply opacity to children of an Object3D
function applyOpacity(object: Three.Object3D, opacity: number): void {
  object.traverse((child) => {
    if (Array.isArray((child as any).material)) {
      ((child as any).material as Three.Material[]).forEach((material) => {
        updateMaterialOpacity(material, opacity);
      });
    } else if ((child as any).material) {
      updateMaterialOpacity((child as any).material, opacity);
    }
  });
}

function updateBoundingBox(planData: PlanData): void {
  let newBoundingBox = new Three.Box3().setFromObject(planData.plan);
  if (
    isFinite(newBoundingBox.max.x) &&
    isFinite(newBoundingBox.min.x) &&
    isFinite(newBoundingBox.max.y) &&
    isFinite(newBoundingBox.min.y) &&
    isFinite(newBoundingBox.max.z) &&
    isFinite(newBoundingBox.min.z)
  ) {
    let newCenter = new Three.Vector3(
      (newBoundingBox.max.x - newBoundingBox.min.x) / 2 + newBoundingBox.min.x,
      (newBoundingBox.max.y - newBoundingBox.min.y) / 2 + newBoundingBox.min.y,
      (newBoundingBox.max.z - newBoundingBox.min.z) / 2 + newBoundingBox.min.z
    );

    planData.plan.position.sub(newCenter);
    planData.grid.position.sub(newCenter);

    newBoundingBox.min.sub(newCenter);
    newBoundingBox.max.sub(newCenter);

    planData.boundingBox = newBoundingBox;
  }
}
