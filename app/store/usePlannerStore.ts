import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { detectAndUpdateAreas } from './areaDetection';
import {
  PlannerState,
  Scene,
  Layer,
  Vertex,
  Line,
  Hole,
  Area,
  Item,
  Group,
  CatalogState,
  CatalogElement,
  RuntimeCatalog,
  SnapElement,
  SnapMask,
  Viewer2DState,
  Point,
  ElementsSet,
  HorizontalGuide,
  VerticalGuide,
  CircularGuide,
  INITIAL_STATE,
  DEFAULT_ELEMENTS_SET,
  DEFAULT_LAYER,
  DEFAULT_SNAP_MASK,
  Mode,
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from './types';

// ============================================================================
// Utility Functions
// ============================================================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateName(prototype: string, type: string): string {
  return `${type}_${generateId()}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const VERTEX_MERGE_THRESHOLD = 30; // scene units (cm) - merge vertices within this distance

/**
 * Find an existing vertex near the given position, excluding certain vertex IDs.
 * Returns the vertex ID if found, or null if none is near enough.
 */
function findNearestVertex(
  layer: Layer,
  x: number,
  y: number,
  excludeIds: Set<string>
): string | null {
  let bestId: string | null = null;
  let bestDist = VERTEX_MERGE_THRESHOLD;

  for (const [id, vertex] of Object.entries(layer.vertices)) {
    if (excludeIds.has(id)) continue;
    const dx = vertex.x - x;
    const dy = vertex.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = id;
    }
  }

  return bestId;
}

/**
 * Merge sourceVertexId into targetVertexId:
 * - All lines referencing source get updated to reference target
 * - Target absorbs source's line references
 * - Source vertex is deleted
 */
function mergeVertices(layer: Layer, sourceVertexId: string, targetVertexId: string): void {
  const source = layer.vertices[sourceVertexId];
  const target = layer.vertices[targetVertexId];
  if (!source || !target) return;

  // Update all lines that reference source to reference target instead
  for (const lineId of source.lines) {
    const line = layer.lines[lineId];
    if (!line) continue;
    line.vertices = line.vertices.map((vId) =>
      vId === sourceVertexId ? targetVertexId : vId
    );
    // Add line to target if not already there
    if (!target.lines.includes(lineId)) {
      target.lines.push(lineId);
    }
  }

  // Copy area references
  for (const areaId of source.areas) {
    if (!target.areas.includes(areaId)) {
      target.areas.push(areaId);
    }
  }

  // Delete the source vertex
  delete layer.vertices[sourceVertexId];

  // Clean up degenerate lines (both endpoints are the same vertex)
  const degenerateLines: string[] = [];
  for (const lineId of target.lines) {
    const line = layer.lines[lineId];
    if (line && line.vertices[0] === line.vertices[1]) {
      degenerateLines.push(lineId);
    }
  }
  for (const lineId of degenerateLines) {
    delete layer.lines[lineId];
    target.lines = target.lines.filter((id) => id !== lineId);
  }
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface PlannerActions {
  // -------------------------------------------------------------------------
  // Project Actions
  // -------------------------------------------------------------------------
  newProject: () => void;
  loadProject: (scene: Scene) => void;
  saveProjectToHistory: () => void;
  setMode: (mode: Mode) => void;
  selectToolEdit: () => void;
  unselectAll: () => void;
  remove: () => void;
  undo: () => void;
  redo: () => void;
  rollback: () => void;
  setProjectProperties: (properties: Partial<Scene>) => void;
  openProjectConfigurator: () => void;
  initCatalog: (catalog: RuntimeCatalog) => void;
  updateMouseCoords: (coords: Point) => void;
  updateZoomScale: (zoom: number) => void;
  toggleSnap: (mask: keyof SnapMask) => void;
  openCatalog: () => void;
  changeCatalogPage: (page: string, oldPath?: string) => void;
  goBackToCatalogPage: () => void;
  throwError: (message: string) => void;
  throwWarning: (message: string) => void;
  copyProperties: (properties: Record<string, unknown>) => void;
  pasteProperties: () => void;
  pushLastSelectedCatalogElementToHistory: (element: string) => void;
  alterateState: () => void;
  setProperties: (properties: Record<string, unknown>) => void;
  setItemsAttributes: (attributes: Record<string, unknown>) => void;
  setLinesAttributes: (attributes: Record<string, unknown>) => void;
  setHolesAttributes: (attributes: Record<string, unknown>) => void;

  // -------------------------------------------------------------------------
  // Viewer2D Actions
  // -------------------------------------------------------------------------
  updateCameraView: (value: Viewer2DState) => void;
  selectToolPan: () => void;
  selectToolZoomIn: () => void;
  selectToolZoomOut: () => void;
  fitSelection: (selection: { x: number; y: number; width: number; height: number }) => void;

  // -------------------------------------------------------------------------
  // Viewer3D Actions
  // -------------------------------------------------------------------------
  selectTool3DView: () => void;
  selectTool3DFirstPerson: () => void;

  // -------------------------------------------------------------------------
  // Scene Actions
  // -------------------------------------------------------------------------
  selectLayer: (layerId: string) => void;
  addLayer: (name: string, altitude: number) => void;
  setLayerProperties: (layerId: string, properties: Partial<Layer>) => void;
  removeLayer: (layerId: string) => void;

  // -------------------------------------------------------------------------
  // Guide Actions
  // -------------------------------------------------------------------------
  addHorizontalGuide: (y: number) => void;
  addVerticalGuide: (x: number) => void;
  addCircularGuide: (x: number, y: number, radius: number) => void;
  removeHorizontalGuide: (id: string) => void;
  removeVerticalGuide: (id: string) => void;
  removeCircularGuide: (id: string) => void;

  // -------------------------------------------------------------------------
  // Line Actions
  // -------------------------------------------------------------------------
  selectLine: (layerId: string, lineId: string) => void;
  selectToolDrawingLine: (type: string) => void;
  beginDrawingLine: (layerId: string, x: number, y: number) => void;
  updateDrawingLine: (x: number, y: number) => void;
  endDrawingLine: (x: number, y: number) => void;
  stopDrawingLine: () => void;
  beginDraggingLine: (layerId: string, lineId: string, x: number, y: number) => void;
  updateDraggingLine: (x: number, y: number) => void;
  endDraggingLine: (x: number, y: number) => void;

  // -------------------------------------------------------------------------
  // Vertex Actions
  // -------------------------------------------------------------------------
  beginDraggingVertex: (layerId: string, vertexId: string, x: number, y: number) => void;
  updateDraggingVertex: (x: number, y: number) => void;
  endDraggingVertex: (x: number, y: number) => void;

  // -------------------------------------------------------------------------
  // Hole Actions
  // -------------------------------------------------------------------------
  selectHole: (layerId: string, holeId: string) => void;
  selectToolDrawingHole: (type: string) => void;
  updateDrawingHole: (layerId: string, x: number, y: number) => void;
  endDrawingHole: (layerId: string, x: number, y: number) => void;
  beginDraggingHole: (layerId: string, holeId: string, x: number, y: number) => void;
  updateDraggingHole: (x: number, y: number) => void;
  endDraggingHole: (x: number, y: number) => void;

  // -------------------------------------------------------------------------
  // Area Actions
  // -------------------------------------------------------------------------
  selectArea: (layerId: string, areaId: string) => void;

  // -------------------------------------------------------------------------
  // Item Actions
  // -------------------------------------------------------------------------
  selectItem: (layerId: string, itemId: string) => void;
  selectToolDrawingItem: (type: string) => void;
  updateDrawingItem: (layerId: string, x: number, y: number) => void;
  endDrawingItem: (layerId: string, x: number, y: number) => void;
  beginDraggingItem: (layerId: string, itemId: string, x: number, y: number) => void;
  updateDraggingItem: (x: number, y: number) => void;
  endDraggingItem: (x: number, y: number) => void;
  beginRotatingItem: (layerId: string, itemId: string, x: number, y: number) => void;
  updateRotatingItem: (x: number, y: number) => void;
  endRotatingItem: (x: number, y: number) => void;

  // -------------------------------------------------------------------------
  // Group Actions
  // -------------------------------------------------------------------------
  addGroup: () => void;
  addGroupFromSelected: () => void;
  selectGroup: (groupId: string) => void;
  unselectGroup: (groupId: string) => void;
  addToGroup: (groupId: string, layerId: string, elementPrototype: string, elementId: string) => void;
  removeFromGroup: (groupId: string, layerId: string, elementPrototype: string, elementId: string) => void;
  setGroupProperties: (groupId: string, properties: Record<string, unknown>) => void;
  setGroupAttributes: (groupId: string, attributes: Partial<Group>) => void;
  setGroupBarycenter: (groupId: string, x: number, y: number) => void;
  removeGroup: (groupId: string) => void;
  removeGroupAndDeleteElements: (groupId: string) => void;
  groupTranslate: (groupId: string, x: number, y: number) => void;
  groupRotate: (groupId: string, rotation: number) => void;
}

// ============================================================================
// Store Type
// ============================================================================

export type PlannerStore = PlannerState & PlannerActions;

// ============================================================================
// Create Store
// ============================================================================

export const usePlannerStore = create<PlannerStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // -----------------------------------------------------------------------
      // Initial State
      // -----------------------------------------------------------------------
      ...INITIAL_STATE,

      // -----------------------------------------------------------------------
      // Project Actions
      // -----------------------------------------------------------------------
      newProject: () =>
        set((state) => {
          Object.assign(state, INITIAL_STATE);
          state.sceneHistory = { past: [], future: [] };
        }),

      loadProject: (scene) =>
        set((state) => {
          state.scene = scene;
          state.sceneHistory = { past: [], future: [] };
          state.mode = MODE_IDLE;
        }),

      saveProjectToHistory: () =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];
          // Keep history size reasonable
          if (state.sceneHistory.past.length > 50) {
            state.sceneHistory.past.shift();
          }
        }),

      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
        }),

      selectToolEdit: () =>
        set((state) => {
          state.mode = MODE_IDLE;
        }),

      unselectAll: () =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (layerId && state.scene.layers[layerId]) {
            const layer = state.scene.layers[layerId];
            // Unselect all elements
            Object.values(layer.vertices).forEach((v) => (v.selected = false));
            Object.values(layer.lines).forEach((l) => (l.selected = false));
            Object.values(layer.holes).forEach((h) => (h.selected = false));
            Object.values(layer.areas).forEach((a) => (a.selected = false));
            Object.values(layer.items).forEach((i) => (i.selected = false));
            layer.selected = { ...DEFAULT_ELEMENTS_SET };
          }
          // Unselect all groups
          Object.values(state.scene.groups).forEach((g) => (g.selected = false));
        }),

      remove: () =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          // Save to history first
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          const selected = layer.selected;

          // Remove selected items
          selected.items.forEach((id) => {
            delete layer.items[id];
          });

          // Remove selected holes
          selected.holes.forEach((id) => {
            const hole = layer.holes[id];
            if (hole) {
              const line = layer.lines[hole.line];
              if (line) {
                line.holes = line.holes.filter((hId) => hId !== id);
              }
              delete layer.holes[id];
            }
          });

          // Remove selected lines (and their holes)
          const removedLines = selected.lines.length > 0;
          selected.lines.forEach((id) => {
            const line = layer.lines[id];
            if (line) {
              // Remove holes on this line
              line.holes.forEach((hId) => {
                delete layer.holes[hId];
              });
              // Remove vertex references
              line.vertices.forEach((vId) => {
                const vertex = layer.vertices[vId];
                if (vertex) {
                  vertex.lines = vertex.lines.filter((lId) => lId !== id);
                  // Remove orphan vertices
                  if (vertex.lines.length === 0 && vertex.areas.length === 0) {
                    delete layer.vertices[vId];
                  }
                }
              });
              delete layer.lines[id];
            }
          });

          // Re-detect areas after removing lines (areas may no longer be valid)
          if (removedLines) {
            detectAndUpdateAreas(layer, state.catalog.elements);
          }

          // Clear selection
          layer.selected = { ...DEFAULT_ELEMENTS_SET };
          state.mode = MODE_IDLE;
        }),

      undo: () =>
        set((state) => {
          if (state.sceneHistory.past.length === 0) return;

          const previousScene = state.sceneHistory.past.pop()!;
          state.sceneHistory.future.push(deepClone(state.scene));
          state.scene = previousScene;
          state.mode = MODE_IDLE;
        }),

      redo: () =>
        set((state) => {
          if (state.sceneHistory.future.length === 0) return;

          const nextScene = state.sceneHistory.future.pop()!;
          state.sceneHistory.past.push(deepClone(state.scene));
          state.scene = nextScene;
          state.mode = MODE_IDLE;
        }),

      rollback: () =>
        set((state) => {
          if (state.sceneHistory.past.length === 0) return;

          // Rollback to last saved state without adding to redo
          const lastScene = state.sceneHistory.past[state.sceneHistory.past.length - 1];
          state.scene = deepClone(lastScene);
          state.mode = MODE_IDLE;
          state.drawingSupport = {};
          state.draggingSupport = {};
          state.rotatingSupport = {};
        }),

      setProjectProperties: (properties) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];
          Object.assign(state.scene, properties);
        }),

      openProjectConfigurator: () =>
        set((state) => {
          state.mode = MODE_CONFIGURING_PROJECT;
        }),

      initCatalog: (catalog) =>
        set((state) => {
          // Extract elements from runtime catalog
          const rootCategory = catalog.getCategory('root');
          const elements: Record<string, CatalogElement> = {};

          // Recursively collect all elements from categories
          const collectElements = (category: { elements: CatalogElement[]; categories: { elements: CatalogElement[]; categories: any[] }[] }) => {
            category.elements.forEach((el) => {
              elements[el.name] = el;
            });
            category.categories.forEach((cat) => collectElements(cat));
          };

          collectElements(rootCategory);

          state.catalog.elements = elements;
          state.catalog.ready = Object.keys(elements).length > 0;
        }),

      updateMouseCoords: (coords) =>
        set((state) => {
          state.mouse = coords;
        }),

      updateZoomScale: (zoom) =>
        set((state) => {
          state.zoom = zoom;
        }),

      toggleSnap: (mask) =>
        set((state) => {
          state.snapMask[mask] = !state.snapMask[mask];
        }),

      openCatalog: () =>
        set((state) => {
          state.mode = MODE_VIEWING_CATALOG;
        }),

      changeCatalogPage: (page, oldPath) =>
        set((state) => {
          if (oldPath !== undefined) {
            state.catalog.path.push(oldPath);
          }
          state.catalog.page = page;
        }),

      goBackToCatalogPage: () =>
        set((state) => {
          if (state.catalog.path.length > 0) {
            state.catalog.page = state.catalog.path.pop()!;
          } else {
            state.catalog.page = 'root';
          }
        }),

      throwError: (message) =>
        set((state) => {
          state.errors.push({ message, date: new Date() });
        }),

      throwWarning: (message) =>
        set((state) => {
          state.warnings.push({ message, date: new Date() });
        }),

      copyProperties: (properties) =>
        set((state) => {
          state.clipboardProperties = properties;
        }),

      pasteProperties: () =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          const layer = state.scene.layers[layerId];
          const selected = layer.selected;

          // Apply clipboard properties to selected elements
          [...selected.lines, ...selected.holes, ...selected.items, ...selected.areas].forEach((id) => {
            const element =
              layer.lines[id] || layer.holes[id] || layer.items[id] || layer.areas[id];
            if (element) {
              Object.assign(element.properties, state.clipboardProperties);
            }
          });
        }),

      pushLastSelectedCatalogElementToHistory: (element) =>
        set((state) => {
          // Remove if already in history
          state.selectedElementsHistory = state.selectedElementsHistory.filter((e) => e !== element);
          // Add to front
          state.selectedElementsHistory.unshift(element);
          // Keep history size reasonable
          if (state.selectedElementsHistory.length > 10) {
            state.selectedElementsHistory.pop();
          }
        }),

      alterateState: () =>
        set((state) => {
          state.alterate = !state.alterate;
        }),

      setProperties: (properties) =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          const selected = layer.selected;

          [...selected.lines, ...selected.holes, ...selected.items, ...selected.areas].forEach((id) => {
            const element =
              layer.lines[id] || layer.holes[id] || layer.items[id] || layer.areas[id];
            if (element) {
              Object.assign(element.properties, properties);
            }
          });
        }),

      setItemsAttributes: (attributes) =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          layer.selected.items.forEach((id) => {
            if (layer.items[id]) {
              Object.assign(layer.items[id], attributes);
            }
          });
        }),

      setLinesAttributes: (attributes) =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          layer.selected.lines.forEach((id) => {
            if (layer.lines[id]) {
              Object.assign(layer.lines[id], attributes);
            }
          });
        }),

      setHolesAttributes: (attributes) =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          layer.selected.holes.forEach((id) => {
            if (layer.holes[id]) {
              Object.assign(layer.holes[id], attributes);
            }
          });
        }),

      // -----------------------------------------------------------------------
      // Viewer2D Actions
      // -----------------------------------------------------------------------
      updateCameraView: (value) =>
        set((state) => {
          state.viewer2D = value;
        }),

      selectToolPan: () =>
        set((state) => {
          state.mode = MODE_2D_PAN;
        }),

      selectToolZoomIn: () =>
        set((state) => {
          state.mode = MODE_2D_ZOOM_IN;
        }),

      selectToolZoomOut: () =>
        set((state) => {
          state.mode = MODE_2D_ZOOM_OUT;
        }),

      fitSelection: (selection) =>
        set((state) => {
          // This would typically use react-svg-pan-zoom's fitSelection
          // For now, we'll just update the viewer2D state
          state.viewer2D = {
            ...state.viewer2D,
            // The actual fitting logic would be handled by the component
          };
        }),

      // -----------------------------------------------------------------------
      // Viewer3D Actions
      // -----------------------------------------------------------------------
      selectTool3DView: () =>
        set((state) => {
          state.mode = MODE_3D_VIEW;
        }),

      selectTool3DFirstPerson: () =>
        set((state) => {
          state.mode = MODE_3D_FIRST_PERSON;
        }),

      // -----------------------------------------------------------------------
      // Scene Actions
      // -----------------------------------------------------------------------
      selectLayer: (layerId) =>
        set((state) => {
          if (state.scene.layers[layerId]) {
            state.scene.selectedLayer = layerId;
          }
        }),

      addLayer: (name, altitude) =>
        set((state) => {
          const id = generateId();
          const order = Object.keys(state.scene.layers).length;
          state.scene.layers[id] = {
            ...DEFAULT_LAYER,
            id,
            name,
            altitude,
            order,
          };
          state.scene.selectedLayer = id;
        }),

      setLayerProperties: (layerId, properties) =>
        set((state) => {
          if (state.scene.layers[layerId]) {
            Object.assign(state.scene.layers[layerId], properties);
          }
        }),

      removeLayer: (layerId) =>
        set((state) => {
          if (Object.keys(state.scene.layers).length <= 1) return;

          delete state.scene.layers[layerId];

          if (state.scene.selectedLayer === layerId) {
            state.scene.selectedLayer = Object.keys(state.scene.layers)[0];
          }
        }),

      // -----------------------------------------------------------------------
      // Guide Actions
      // -----------------------------------------------------------------------
      addHorizontalGuide: (y) =>
        set((state) => {
          const id = generateId();
          state.scene.guides.horizontal[id] = { id, y };
        }),

      addVerticalGuide: (x) =>
        set((state) => {
          const id = generateId();
          state.scene.guides.vertical[id] = { id, x };
        }),

      addCircularGuide: (x, y, radius) =>
        set((state) => {
          const id = generateId();
          state.scene.guides.circular[id] = { id, x, y, radius };
        }),

      removeHorizontalGuide: (id) =>
        set((state) => {
          delete state.scene.guides.horizontal[id];
        }),

      removeVerticalGuide: (id) =>
        set((state) => {
          delete state.scene.guides.vertical[id];
        }),

      removeCircularGuide: (id) =>
        set((state) => {
          delete state.scene.guides.circular[id];
        }),

      // -----------------------------------------------------------------------
      // Line Actions
      // -----------------------------------------------------------------------
      selectLine: (layerId, lineId) =>
        set((state) => {
          get().unselectAll();
          const layer = state.scene.layers[layerId];
          if (layer && layer.lines[lineId]) {
            layer.lines[lineId].selected = true;
            layer.selected.lines.push(lineId);
          }
        }),

      selectToolDrawingLine: (type) =>
        set((state) => {
          state.mode = MODE_WAITING_DRAWING_LINE;
          state.drawingSupport = { type };
        }),

      beginDrawingLine: (layerId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          if (!layer) return;

          const type = state.drawingSupport.type || 'wall';
          const rx = Math.round(x);
          const ry = Math.round(y);

          // Check if there's an existing vertex near the start position — reuse it
          const existingV0 = findNearestVertex(layer, rx, ry, new Set());
          let v0Id: string;

          if (existingV0) {
            v0Id = existingV0;
          } else {
            // Create first vertex
            v0Id = generateId();
            layer.vertices[v0Id] = {
              id: v0Id,
              type: '',
              prototype: 'vertices',
              name: generateName('vertices', 'vertex'),
              x: rx,
              y: ry,
              lines: [],
              areas: [],
              misc: {},
              selected: false,
              properties: {},
              visible: true,
            };
          }

          // Create second vertex at same position (will be updated on move)
          const v1Id = generateId();
          layer.vertices[v1Id] = {
            id: v1Id,
            type: '',
            prototype: 'vertices',
            name: generateName('vertices', 'vertex'),
            x: rx,
            y: ry,
            lines: [],
            areas: [],
            misc: {},
            selected: false,
            properties: {},
            visible: true,
          };

          // Create line
          const lineId = generateId();
          const catalogElement = state.catalog.elements[type];
          const properties: Record<string, unknown> = {};

          if (catalogElement) {
            Object.entries(catalogElement.properties).forEach(([key, prop]) => {
              properties[key] = prop.defaultValue;
            });
          }

          layer.lines[lineId] = {
            id: lineId,
            type,
            prototype: 'lines',
            name: generateName('lines', type),
            vertices: [v0Id, v1Id],
            holes: [],
            misc: {},
            selected: false,
            properties,
            visible: true,
          };

          // Link vertices to line
          layer.vertices[v0Id].lines.push(lineId);
          layer.vertices[v1Id].lines.push(lineId);

          state.drawingSupport = {
            ...state.drawingSupport,
            layerID: layerId,
            currentVertex: v1Id,
            lines: [lineId],
          };
          state.mode = MODE_DRAWING_LINE;
        }),

      updateDrawingLine: (x, y) =>
        set((state) => {
          const { layerID, currentVertex } = state.drawingSupport;
          if (!layerID || !currentVertex) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.vertices[currentVertex]) return;

          layer.vertices[currentVertex].x = Math.round(x);
          layer.vertices[currentVertex].y = Math.round(y);
        }),

      endDrawingLine: (x, y) =>
        set((state) => {
          const { layerID, currentVertex, type } = state.drawingSupport;
          if (!layerID || !currentVertex) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.vertices[currentVertex]) return;

          const rx = Math.round(x);
          const ry = Math.round(y);

          // Finalize current vertex position
          layer.vertices[currentVertex].x = rx;
          layer.vertices[currentVertex].y = ry;

          // Check if there's an existing vertex near this position — merge if so
          // Exclude the current vertex and any vertex on the same "in-progress" line
          const excludeIds = new Set<string>([currentVertex]);
          const existingVertexId = findNearestVertex(layer, rx, ry, excludeIds);

          let prevVertexId = currentVertex;
          if (existingVertexId) {
            // Merge current vertex into the existing one
            mergeVertices(layer, currentVertex, existingVertexId);
            prevVertexId = existingVertexId;
          }

          // Continue drawing: create new vertex and line
          const newVertexId = generateId();
          layer.vertices[newVertexId] = {
            id: newVertexId,
            type: '',
            prototype: 'vertices',
            name: generateName('vertices', 'vertex'),
            x: rx,
            y: ry,
            lines: [],
            areas: [],
            misc: {},
            selected: false,
            properties: {},
            visible: true,
          };

          // Create new line connecting prev vertex to new vertex
          const newLineId = generateId();
          const catalogElement = state.catalog.elements[type || 'wall'];
          const properties: Record<string, unknown> = {};

          if (catalogElement) {
            Object.entries(catalogElement.properties).forEach(([key, prop]) => {
              properties[key] = prop.defaultValue;
            });
          }

          layer.lines[newLineId] = {
            id: newLineId,
            type: type || 'wall',
            prototype: 'lines',
            name: generateName('lines', type || 'wall'),
            vertices: [prevVertexId, newVertexId],
            holes: [],
            misc: {},
            selected: false,
            properties,
            visible: true,
          };

          layer.vertices[prevVertexId].lines.push(newLineId);
          layer.vertices[newVertexId].lines.push(newLineId);

          // Detect and update areas after adding the line
          detectAndUpdateAreas(layer, state.catalog.elements);

          state.drawingSupport = {
            ...state.drawingSupport,
            currentVertex: newVertexId,
            lines: [...(state.drawingSupport.lines || []), newLineId],
          };
        }),

      // Stop drawing and keep all committed walls. Removes only the trailing
      // in-progress line and its loose endpoint vertex.
      stopDrawingLine: () =>
        set((state) => {
          const { layerID, currentVertex, lines: drawingLines } = state.drawingSupport;
          if (!layerID || !currentVertex) {
            state.mode = MODE_IDLE;
            state.drawingSupport = {};
            return;
          }

          const layer = state.scene.layers[layerID];
          if (layer) {
            // The last line in drawingLines is the trailing in-progress line
            // (connects last committed vertex → currentVertex which follows cursor)
            const trailingLineId = drawingLines?.[drawingLines.length - 1];
            if (trailingLineId && layer.lines[trailingLineId]) {
              const trailingLine = layer.lines[trailingLineId];
              // Remove line reference from its vertices
              for (const vId of trailingLine.vertices) {
                const v = layer.vertices[vId];
                if (v) {
                  v.lines = v.lines.filter((id) => id !== trailingLineId);
                }
              }
              delete layer.lines[trailingLineId];
            }

            // Remove the trailing cursor vertex if it has no remaining lines
            const cv = layer.vertices[currentVertex];
            if (cv && cv.lines.length === 0) {
              delete layer.vertices[currentVertex];
            }

            // Also clean up any orphan vertices with no lines
            for (const [vId, vertex] of Object.entries(layer.vertices)) {
              if (vertex.lines.length === 0 && vertex.areas.length === 0) {
                delete layer.vertices[vId];
              }
            }

            // Run area detection with the final state
            detectAndUpdateAreas(layer, state.catalog.elements);
          }

          state.mode = MODE_IDLE;
          state.drawingSupport = {};
        }),

      beginDraggingLine: (layerId, lineId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          state.mode = MODE_DRAGGING_LINE;
          state.draggingSupport = {
            layerID: layerId,
            lineId,
            startPointX: x,
            startPointY: y,
          };
        }),

      updateDraggingLine: (x, y) =>
        set((state) => {
          const { layerID, lineId, startPointX, startPointY } = state.draggingSupport as any;
          if (!layerID || !lineId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.lines[lineId]) return;

          const dx = x - startPointX;
          const dy = y - startPointY;

          const line = layer.lines[lineId];
          line.vertices.forEach((vId) => {
            const vertex = layer.vertices[vId];
            if (vertex) {
              vertex.x += dx;
              vertex.y += dy;
            }
          });

          state.draggingSupport.startPointX = x;
          state.draggingSupport.startPointY = y;
        }),

      endDraggingLine: (x, y) =>
        set((state) => {
          const { layerID } = state.draggingSupport as { layerID?: string };
          if (layerID) {
            const layer = state.scene.layers[layerID];
            if (layer) {
              detectAndUpdateAreas(layer, state.catalog.elements);
            }
          }
          state.mode = MODE_IDLE;
          state.draggingSupport = {};
        }),

      // -----------------------------------------------------------------------
      // Vertex Actions
      // -----------------------------------------------------------------------
      beginDraggingVertex: (layerId, vertexId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          state.mode = MODE_DRAGGING_VERTEX;
          state.draggingSupport = {
            layerID: layerId,
            vertexId,
            startPointX: x,
            startPointY: y,
          };
        }),

      updateDraggingVertex: (x, y) =>
        set((state) => {
          const { layerID, vertexId } = state.draggingSupport as any;
          if (!layerID || !vertexId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.vertices[vertexId]) return;

          layer.vertices[vertexId].x = Math.round(x);
          layer.vertices[vertexId].y = Math.round(y);
        }),

      endDraggingVertex: (x, y) =>
        set((state) => {
          const { layerID, vertexId } = state.draggingSupport as any;
          if (!layerID || !vertexId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.vertices[vertexId]) return;

          const rx = Math.round(x);
          const ry = Math.round(y);
          layer.vertices[vertexId].x = rx;
          layer.vertices[vertexId].y = ry;

          // Merge with existing vertex if dragged onto one
          const existingVertexId = findNearestVertex(layer, rx, ry, new Set([vertexId]));
          if (existingVertexId) {
            mergeVertices(layer, vertexId, existingVertexId);
          }

          // Detect and update areas after moving vertex
          detectAndUpdateAreas(layer, state.catalog.elements);

          state.mode = MODE_IDLE;
          state.draggingSupport = {};
        }),

      // -----------------------------------------------------------------------
      // Hole Actions
      // -----------------------------------------------------------------------
      selectHole: (layerId, holeId) =>
        set((state) => {
          get().unselectAll();
          const layer = state.scene.layers[layerId];
          if (layer && layer.holes[holeId]) {
            layer.holes[holeId].selected = true;
            layer.selected.holes.push(holeId);
          }
        }),

      selectToolDrawingHole: (type) =>
        set((state) => {
          state.mode = MODE_DRAWING_HOLE;
          state.drawingSupport = { type };
        }),

      updateDrawingHole: (layerId, x, y) =>
        set((state) => {
          // Preview logic would go here
        }),

      endDrawingHole: (layerId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          if (!layer) return;

          const type = state.drawingSupport.type || 'door';

          // Find the line under the cursor
          // This is simplified - real implementation would use geometry utils
          let targetLine: Line | null = null;
          let targetLineId: string | null = null;

          for (const [lineId, line] of Object.entries(layer.lines)) {
            const v0 = layer.vertices[line.vertices[0]];
            const v1 = layer.vertices[line.vertices[1]];
            if (v0 && v1) {
              // Simple point-to-line distance check
              // Real implementation would be more sophisticated
              const dist = Math.abs(
                (v1.y - v0.y) * x - (v1.x - v0.x) * y + v1.x * v0.y - v1.y * v0.x
              ) / Math.sqrt((v1.y - v0.y) ** 2 + (v1.x - v0.x) ** 2);
              if (dist < 10) {
                targetLine = line;
                targetLineId = lineId;
                break;
              }
            }
          }

          if (targetLine && targetLineId) {
            const holeId = generateId();
            const catalogElement = state.catalog.elements[type];
            const properties: Record<string, unknown> = {};

            if (catalogElement) {
              Object.entries(catalogElement.properties).forEach(([key, prop]) => {
                properties[key] = prop.defaultValue;
              });
            }

            layer.holes[holeId] = {
              id: holeId,
              type,
              prototype: 'holes',
              name: generateName('holes', type),
              offset: 0.5, // Middle of line
              line: targetLineId,
              misc: {},
              selected: false,
              properties,
              visible: true,
            };

            targetLine.holes.push(holeId);
          }

          state.mode = MODE_IDLE;
          state.drawingSupport = {};
        }),

      beginDraggingHole: (layerId, holeId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          state.mode = MODE_DRAGGING_HOLE;
          state.draggingSupport = {
            layerID: layerId,
            holeId,
            startPointX: x,
            startPointY: y,
          };
        }),

      updateDraggingHole: (x, y) =>
        set((state) => {
          const { layerID, holeId } = state.draggingSupport as any;
          if (!layerID || !holeId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.holes[holeId]) return;

          const hole = layer.holes[holeId];
          const line = layer.lines[hole.line];
          if (!line) return;

          const v0 = layer.vertices[line.vertices[0]];
          const v1 = layer.vertices[line.vertices[1]];
          if (!v0 || !v1) return;

          // Calculate offset along line
          const lineLength = Math.sqrt((v1.x - v0.x) ** 2 + (v1.y - v0.y) ** 2);
          const dx = v1.x - v0.x;
          const dy = v1.y - v0.y;

          // Project point onto line
          const t = Math.max(0, Math.min(1,
            ((x - v0.x) * dx + (y - v0.y) * dy) / (lineLength * lineLength)
          ));

          hole.offset = t;
        }),

      endDraggingHole: (x, y) =>
        set((state) => {
          state.mode = MODE_IDLE;
          state.draggingSupport = {};
        }),

      // -----------------------------------------------------------------------
      // Area Actions
      // -----------------------------------------------------------------------
      selectArea: (layerId, areaId) =>
        set((state) => {
          get().unselectAll();
          const layer = state.scene.layers[layerId];
          if (layer && layer.areas[areaId]) {
            layer.areas[areaId].selected = true;
            layer.selected.areas.push(areaId);
          }
        }),

      // -----------------------------------------------------------------------
      // Item Actions
      // -----------------------------------------------------------------------
      selectItem: (layerId, itemId) =>
        set((state) => {
          get().unselectAll();
          const layer = state.scene.layers[layerId];
          if (layer && layer.items[itemId]) {
            layer.items[itemId].selected = true;
            layer.selected.items.push(itemId);
          }
        }),

      selectToolDrawingItem: (type) =>
        set((state) => {
          state.mode = MODE_DRAWING_ITEM;
          state.drawingSupport = { type };
        }),

      updateDrawingItem: (layerId, x, y) =>
        set((state) => {
          // Preview logic
        }),

      endDrawingItem: (layerId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          if (!layer) return;

          const type = state.drawingSupport.type || 'sofa';
          const itemId = generateId();
          const catalogElement = state.catalog.elements[type];
          const properties: Record<string, unknown> = {};

          if (catalogElement) {
            Object.entries(catalogElement.properties).forEach(([key, prop]) => {
              properties[key] = prop.defaultValue;
            });
          }

          layer.items[itemId] = {
            id: itemId,
            type,
            prototype: 'items',
            name: generateName('items', type),
            x: Math.round(x),
            y: Math.round(y),
            rotation: 0,
            misc: {},
            selected: false,
            properties,
            visible: true,
          };

          state.mode = MODE_IDLE;
          state.drawingSupport = {};
        }),

      beginDraggingItem: (layerId, itemId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          if (!layer || !layer.items[itemId]) return;

          state.mode = MODE_DRAGGING_ITEM;
          state.draggingSupport = {
            layerID: layerId,
            itemId,
            startPointX: x,
            startPointY: y,
            originalX: layer.items[itemId].x,
            originalY: layer.items[itemId].y,
          };
        }),

      updateDraggingItem: (x, y) =>
        set((state) => {
          const { layerID, itemId, startPointX, startPointY, originalX, originalY } = state.draggingSupport as any;
          if (!layerID || !itemId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.items[itemId]) return;

          const dx = x - startPointX;
          const dy = y - startPointY;

          layer.items[itemId].x = originalX + dx;
          layer.items[itemId].y = originalY + dy;
        }),

      endDraggingItem: (x, y) =>
        set((state) => {
          state.mode = MODE_IDLE;
          state.draggingSupport = {};
        }),

      beginRotatingItem: (layerId, itemId, x, y) =>
        set((state) => {
          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const layer = state.scene.layers[layerId];
          if (!layer || !layer.items[itemId]) return;

          state.mode = MODE_ROTATING_ITEM;
          state.rotatingSupport = {
            layerID: layerId,
            itemId,
            startPointX: x,
            startPointY: y,
            originalRotation: layer.items[itemId].rotation,
          };
        }),

      updateRotatingItem: (x, y) =>
        set((state) => {
          const { layerID, itemId, startPointX, startPointY, originalRotation } = state.rotatingSupport as any;
          if (!layerID || !itemId) return;

          const layer = state.scene.layers[layerID];
          if (!layer || !layer.items[itemId]) return;

          const item = layer.items[itemId];
          const centerX = item.x;
          const centerY = item.y;

          const startAngle = Math.atan2(startPointY - centerY, startPointX - centerX);
          const currentAngle = Math.atan2(y - centerY, x - centerX);
          const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);

          item.rotation = originalRotation + deltaAngle;
        }),

      endRotatingItem: (x, y) =>
        set((state) => {
          state.mode = MODE_IDLE;
          state.rotatingSupport = {};
        }),

      // -----------------------------------------------------------------------
      // Group Actions
      // -----------------------------------------------------------------------
      addGroup: () =>
        set((state) => {
          const groupId = generateId();
          state.scene.groups[groupId] = {
            id: groupId,
            type: 'group',
            prototype: 'groups',
            name: generateName('groups', 'group'),
            x: 0,
            y: 0,
            rotation: 0,
            elements: {},
            misc: {},
            selected: false,
            properties: {},
            visible: true,
          };
        }),

      addGroupFromSelected: () =>
        set((state) => {
          const layerId = state.scene.selectedLayer;
          if (!layerId || !state.scene.layers[layerId]) return;

          const layer = state.scene.layers[layerId];
          const selected = layer.selected;

          if (
            selected.lines.length === 0 &&
            selected.holes.length === 0 &&
            selected.items.length === 0 &&
            selected.areas.length === 0
          ) {
            return;
          }

          const groupId = generateId();
          state.scene.groups[groupId] = {
            id: groupId,
            type: 'group',
            prototype: 'groups',
            name: generateName('groups', 'group'),
            x: 0,
            y: 0,
            rotation: 0,
            elements: {
              [layerId]: {
                lines: [...selected.lines],
                holes: [...selected.holes],
                items: [...selected.items],
                areas: [...selected.areas],
              },
            },
            misc: {},
            selected: false,
            properties: {},
            visible: true,
          };
        }),

      selectGroup: (groupId) =>
        set((state) => {
          get().unselectAll();
          if (state.scene.groups[groupId]) {
            state.scene.groups[groupId].selected = true;
          }
        }),

      unselectGroup: (groupId) =>
        set((state) => {
          if (state.scene.groups[groupId]) {
            state.scene.groups[groupId].selected = false;
          }
        }),

      addToGroup: (groupId, layerId, elementPrototype, elementId) =>
        set((state) => {
          const group = state.scene.groups[groupId];
          if (!group) return;

          if (!group.elements[layerId]) {
            group.elements[layerId] = {};
          }
          if (!group.elements[layerId][elementPrototype]) {
            group.elements[layerId][elementPrototype] = [];
          }
          if (!group.elements[layerId][elementPrototype].includes(elementId)) {
            group.elements[layerId][elementPrototype].push(elementId);
          }
        }),

      removeFromGroup: (groupId, layerId, elementPrototype, elementId) =>
        set((state) => {
          const group = state.scene.groups[groupId];
          if (!group || !group.elements[layerId] || !group.elements[layerId][elementPrototype]) return;

          group.elements[layerId][elementPrototype] = group.elements[layerId][elementPrototype].filter(
            (id) => id !== elementId
          );
        }),

      setGroupProperties: (groupId, properties) =>
        set((state) => {
          if (state.scene.groups[groupId]) {
            Object.assign(state.scene.groups[groupId].properties, properties);
          }
        }),

      setGroupAttributes: (groupId, attributes) =>
        set((state) => {
          if (state.scene.groups[groupId]) {
            Object.assign(state.scene.groups[groupId], attributes);
          }
        }),

      setGroupBarycenter: (groupId, x, y) =>
        set((state) => {
          if (state.scene.groups[groupId]) {
            state.scene.groups[groupId].x = x;
            state.scene.groups[groupId].y = y;
          }
        }),

      removeGroup: (groupId) =>
        set((state) => {
          delete state.scene.groups[groupId];
        }),

      removeGroupAndDeleteElements: (groupId) =>
        set((state) => {
          const group = state.scene.groups[groupId];
          if (!group) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          // Delete all elements in the group
          Object.entries(group.elements).forEach(([layerId, elements]) => {
            const layer = state.scene.layers[layerId];
            if (!layer) return;

            Object.entries(elements).forEach(([prototype, ids]) => {
              (ids as string[]).forEach((id) => {
                if (prototype === 'lines') {
                  const line = layer.lines[id];
                  if (line) {
                    // Remove holes on this line
                    line.holes.forEach((hId) => {
                      delete layer.holes[hId];
                    });
                    // Remove vertex references
                    line.vertices.forEach((vId) => {
                      const vertex = layer.vertices[vId];
                      if (vertex) {
                        vertex.lines = vertex.lines.filter((lId) => lId !== id);
                        if (vertex.lines.length === 0 && vertex.areas.length === 0) {
                          delete layer.vertices[vId];
                        }
                      }
                    });
                    delete layer.lines[id];
                  }
                } else if (prototype === 'holes') {
                  const hole = layer.holes[id];
                  if (hole) {
                    const line = layer.lines[hole.line];
                    if (line) {
                      line.holes = line.holes.filter((hId) => hId !== id);
                    }
                    delete layer.holes[id];
                  }
                } else if (prototype === 'items') {
                  delete layer.items[id];
                } else if (prototype === 'areas') {
                  delete layer.areas[id];
                }
              });
            });
          });

          delete state.scene.groups[groupId];
        }),

      groupTranslate: (groupId, x, y) =>
        set((state) => {
          const group = state.scene.groups[groupId];
          if (!group) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const dx = x - group.x;
          const dy = y - group.y;

          group.x = x;
          group.y = y;

          // Translate all elements in the group
          Object.entries(group.elements).forEach(([layerId, elements]) => {
            const layer = state.scene.layers[layerId];
            if (!layer) return;

            const vertexIds = new Set<string>();

            // Collect all vertices from lines
            (elements.lines || []).forEach((lineId) => {
              const line = layer.lines[lineId];
              if (line) {
                line.vertices.forEach((vId) => vertexIds.add(vId));
              }
            });

            // Translate vertices
            vertexIds.forEach((vId) => {
              const vertex = layer.vertices[vId];
              if (vertex) {
                vertex.x += dx;
                vertex.y += dy;
              }
            });

            // Translate items
            (elements.items || []).forEach((itemId) => {
              const item = layer.items[itemId];
              if (item) {
                item.x += dx;
                item.y += dy;
              }
            });
          });
        }),

      groupRotate: (groupId, rotation) =>
        set((state) => {
          const group = state.scene.groups[groupId];
          if (!group) return;

          state.sceneHistory.past.push(deepClone(state.scene));
          state.sceneHistory.future = [];

          const deltaRotation = rotation - group.rotation;
          const centerX = group.x;
          const centerY = group.y;

          group.rotation = rotation;

          // Rotate all elements around group center
          Object.entries(group.elements).forEach(([layerId, elements]) => {
            const layer = state.scene.layers[layerId];
            if (!layer) return;

            const vertexIds = new Set<string>();

            // Collect all vertices from lines
            (elements.lines || []).forEach((lineId) => {
              const line = layer.lines[lineId];
              if (line) {
                line.vertices.forEach((vId) => vertexIds.add(vId));
              }
            });

            // Rotate vertices around center
            const rad = (deltaRotation * Math.PI) / 180;
            vertexIds.forEach((vId) => {
              const vertex = layer.vertices[vId];
              if (vertex) {
                const dx = vertex.x - centerX;
                const dy = vertex.y - centerY;
                vertex.x = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
                vertex.y = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);
              }
            });

            // Rotate items around center
            (elements.items || []).forEach((itemId) => {
              const item = layer.items[itemId];
              if (item) {
                const dx = item.x - centerX;
                const dy = item.y - centerY;
                item.x = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
                item.y = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);
                item.rotation += deltaRotation;
              }
            });
          });
        }),
    }))
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

export const useMode = () => usePlannerStore((state) => state.mode);
export const useScene = () => usePlannerStore((state) => state.scene);
export const useViewer2D = () => usePlannerStore((state) => state.viewer2D);
export const useCatalog = () => usePlannerStore((state) => state.catalog);
export const useSelectedLayer = () => usePlannerStore((state) => {
  const selectedLayerId = state.scene.selectedLayer;
  return selectedLayerId ? state.scene.layers[selectedLayerId] : null;
});
export const useMouse = () => usePlannerStore((state) => state.mouse);
export const useZoom = () => usePlannerStore((state) => state.zoom);
export const useCanUndo = () => usePlannerStore((state) => state.sceneHistory.past.length > 0);
export const useCanRedo = () => usePlannerStore((state) => state.sceneHistory.future.length > 0);
