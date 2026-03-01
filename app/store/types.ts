// Plain TypeScript interfaces replacing Immutable.js Records
// These are the core state types for the Zustand store

// ============================================================================
// Constants (Mode values)
// ============================================================================

export const MODE_IDLE = 'MODE_IDLE';
export const MODE_2D_ZOOM_IN = 'MODE_2D_ZOOM_IN';
export const MODE_2D_ZOOM_OUT = 'MODE_2D_ZOOM_OUT';
export const MODE_2D_PAN = 'MODE_2D_PAN';
export const MODE_3D_VIEW = 'MODE_3D_VIEW';
export const MODE_3D_FIRST_PERSON = 'MODE_3D_FIRST_PERSON';
export const MODE_WAITING_DRAWING_LINE = 'MODE_WAITING_DRAWING_LINE';
export const MODE_DRAGGING_LINE = 'MODE_DRAGGING_LINE';
export const MODE_DRAGGING_VERTEX = 'MODE_DRAGGING_VERTEX';
export const MODE_DRAGGING_ITEM = 'MODE_DRAGGING_ITEM';
export const MODE_DRAGGING_HOLE = 'MODE_DRAGGING_HOLE';
export const MODE_DRAWING_LINE = 'MODE_DRAWING_LINE';
export const MODE_DRAWING_HOLE = 'MODE_DRAWING_HOLE';
export const MODE_DRAWING_ITEM = 'MODE_DRAWING_ITEM';
export const MODE_ROTATING_ITEM = 'MODE_ROTATING_ITEM';
export const MODE_UPLOADING_IMAGE = 'MODE_UPLOADING_IMAGE';
export const MODE_FITTING_IMAGE = 'MODE_FITTING_IMAGE';
export const MODE_VIEWING_CATALOG = 'MODE_VIEWING_CATALOG';
export const MODE_CONFIGURING_PROJECT = 'MODE_CONFIGURING_PROJECT';

export type Mode =
  | typeof MODE_IDLE
  | typeof MODE_2D_ZOOM_IN
  | typeof MODE_2D_ZOOM_OUT
  | typeof MODE_2D_PAN
  | typeof MODE_3D_VIEW
  | typeof MODE_3D_FIRST_PERSON
  | typeof MODE_WAITING_DRAWING_LINE
  | typeof MODE_DRAGGING_LINE
  | typeof MODE_DRAGGING_VERTEX
  | typeof MODE_DRAGGING_ITEM
  | typeof MODE_DRAGGING_HOLE
  | typeof MODE_DRAWING_LINE
  | typeof MODE_DRAWING_HOLE
  | typeof MODE_DRAWING_ITEM
  | typeof MODE_ROTATING_ITEM
  | typeof MODE_UPLOADING_IMAGE
  | typeof MODE_FITTING_IMAGE
  | typeof MODE_VIEWING_CATALOG
  | typeof MODE_CONFIGURING_PROJECT;

// ============================================================================
// Geometry Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

// ============================================================================
// Property Types
// ============================================================================

export interface PropertyValue {
  value: string | number | boolean;
  unit?: string;
}

// ============================================================================
// Shared Attributes (base for all elements)
// ============================================================================

export interface SharedAttributes {
  id: string;
  type: string;
  prototype: 'vertices' | 'lines' | 'holes' | 'areas' | 'items' | 'groups';
  name: string;
  misc: Record<string, unknown>;
  selected: boolean;
  properties: Record<string, unknown>;
  visible: boolean;
}

// ============================================================================
// Grid Type
// ============================================================================

export interface Grid {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

// ============================================================================
// Elements Set (tracks selected elements per layer)
// ============================================================================

export interface ElementsSet {
  vertices: string[];
  lines: string[];
  holes: string[];
  areas: string[];
  items: string[];
  selected: string[];
}

// ============================================================================
// Vertex Type
// ============================================================================

export interface Vertex extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'vertices';
  x: number;
  y: number;
  lines: string[];
  areas: string[];
}

// ============================================================================
// Line Type
// ============================================================================

export interface Line extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'lines';
  vertices: string[];
  holes: string[];
}

// ============================================================================
// Hole Type
// ============================================================================

export interface Hole extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'holes';
  offset: number;
  line: string;
}

// ============================================================================
// Area Type
// ============================================================================

export interface Area extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'areas';
  vertices: string[];
  holes: string[];
}

// ============================================================================
// Item Type
// ============================================================================

export interface Item extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'items';
  x: number;
  y: number;
  rotation: number;
}

// ============================================================================
// Layer Type
// ============================================================================

export interface Layer {
  id: string;
  altitude: number;
  order: number;
  opacity: number;
  name: string;
  visible: boolean;
  vertices: Record<string, Vertex>;
  lines: Record<string, Line>;
  holes: Record<string, Hole>;
  areas: Record<string, Area>;
  items: Record<string, Item>;
  selected: ElementsSet;
}

// ============================================================================
// Group Type
// ============================================================================

export interface Group extends Omit<SharedAttributes, 'prototype'> {
  prototype: 'groups';
  x: number;
  y: number;
  rotation: number;
  elements: Record<string, Record<string, string[]>>;
}

// ============================================================================
// Guides Types
// ============================================================================

export interface HorizontalGuide {
  id: string;
  y: number;
}

export interface VerticalGuide {
  id: string;
  x: number;
}

export interface CircularGuide {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Guides {
  horizontal: Record<string, HorizontalGuide>;
  vertical: Record<string, VerticalGuide>;
  circular: Record<string, CircularGuide>;
}

// ============================================================================
// Scene Type
// ============================================================================

export interface Scene {
  unit: string;
  layers: Record<string, Layer>;
  grids: Record<string, Grid>;
  selectedLayer: string | null;
  groups: Record<string, Group>;
  width: number;
  height: number;
  meta: Record<string, unknown>;
  guides: Guides;
}

// ============================================================================
// Catalog Types
// ============================================================================

export interface CatalogElementInfo {
  tag: string | string[];
  description: string;
  image: string;
  title?: string;
  visibility?: { catalog: boolean };
  [key: string]: unknown;
}

export interface CatalogElement {
  name: string;
  prototype: string;
  info: CatalogElementInfo;
  properties: Record<string, {
    type: string;
    defaultValue: unknown;
    [key: string]: unknown;
  }>;
  render2D?: (element: unknown, layer: unknown, scene: unknown) => React.ReactElement;
  render3D?: (element: unknown, layer: unknown, scene: unknown) => Promise<unknown>;
  [key: string]: unknown;
}

export interface CatalogCategory {
  name: string;
  label: string;
  elements: CatalogElement[];
  categories: CatalogCategory[];
}

// Runtime catalog class interface (for the Catalog class from catalog.ts)
export interface RuntimeCatalog {
  unit: string;
  getElement: (type: string) => CatalogElement;
  getCategory: (categoryName: string) => CatalogCategory;
  hasElement: (type: string) => boolean;
  hasCategory: (categoryName: string) => boolean;
  getPropertyType: (type: string) => {
    type: string;
    Viewer: React.ComponentType<unknown>;
    Editor: React.ComponentType<unknown>;
  };
}

// State representation of catalog in store
export interface CatalogState {
  ready: boolean;
  page: string;
  path: string[];
  elements: Record<string, CatalogElement>;
}

// ============================================================================
// History Types
// ============================================================================

export interface HistoryStructure {
  past: Scene[];
  future: Scene[];
}

// ============================================================================
// Snap Types
// ============================================================================

export interface SnapMask {
  SNAP_POINT: boolean;
  SNAP_LINE: boolean;
  SNAP_SEGMENT: boolean;
  SNAP_GRID: boolean;
  SNAP_GUIDE: boolean;
}

export interface SnapElement {
  type: 'point' | 'line' | 'segment' | 'grid' | 'guide';
  x: number;
  y: number;
  radius?: number;
  priority: number;
  related: string[];
}

// ============================================================================
// Viewer2D Types
// ============================================================================

export interface Viewer2DState {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  e?: number;
  f?: number;
  version?: number;
  mode?: string;
  focus?: boolean;
  pinchPointDistance?: number | null;
  prePinchMode?: string | null;
  viewerWidth?: number;
  viewerHeight?: number;
  SVGWidth?: number;
  SVGHeight?: number;
  startX?: number | null;
  startY?: number | null;
  endX?: number | null;
  endY?: number | null;
  miniatureOpen?: boolean;
  miniatureViewerWidth?: number;
  miniatureViewerHeight?: number;
  miniatureWidth?: number;
  miniatureHeight?: number;
}

// ============================================================================
// Drawing/Dragging/Rotating Support Types
// ============================================================================

export interface DrawingSupport {
  layerID?: string;
  type?: string;
  currentVertex?: string;
  startAt?: Point;
  lines?: string[];
  [key: string]: unknown;
}

export interface DraggingSupport {
  layerID?: string;
  startPointX?: number;
  startPointY?: number;
  originalX?: number;
  originalY?: number;
  [key: string]: unknown;
}

export interface RotatingSupport {
  layerID?: string;
  startPointX?: number;
  startPointY?: number;
  originalRotation?: number;
  [key: string]: unknown;
}

// ============================================================================
// Error/Warning Types
// ============================================================================

export interface AppError {
  message: string;
  date: Date;
}

export interface AppWarning {
  message: string;
  date: Date;
}

// ============================================================================
// Main Planner State
// ============================================================================

export interface PlannerState {
  // Core state
  mode: Mode;
  overlays: unknown[];
  scene: Scene;
  sceneHistory: HistoryStructure;
  catalog: CatalogState;

  // Viewer state
  viewer2D: Viewer2DState;

  // Mouse and zoom
  mouse: Point;
  zoom: number;

  // Snap system
  snapMask: SnapMask;
  snapElements: SnapElement[];
  activeSnapElement: SnapElement | null;

  // Drawing/Dragging/Rotating support
  drawingSupport: DrawingSupport;
  draggingSupport: DraggingSupport;
  rotatingSupport: RotatingSupport;

  // Errors and warnings
  errors: AppError[];
  warnings: AppWarning[];

  // Clipboard
  clipboardProperties: Record<string, unknown>;

  // History of selected catalog elements
  selectedElementsHistory: string[];

  // Miscellaneous
  misc: Record<string, unknown>;
  alterate: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_SNAP_MASK: SnapMask = {
  SNAP_POINT: true,
  SNAP_LINE: true,
  SNAP_SEGMENT: true,
  SNAP_GRID: false,
  SNAP_GUIDE: true,
};

export const DEFAULT_ELEMENTS_SET: ElementsSet = {
  vertices: [],
  lines: [],
  holes: [],
  areas: [],
  items: [],
  selected: [],
};

export const DEFAULT_LAYER: Layer = {
  id: 'layer-1',
  altitude: 0,
  order: 0,
  opacity: 1,
  name: 'default',
  visible: true,
  vertices: {},
  lines: {},
  holes: {},
  areas: {},
  items: {},
  selected: { ...DEFAULT_ELEMENTS_SET },
};

export const DEFAULT_GRIDS: Record<string, Grid> = {
  h1: {
    id: 'h1',
    type: 'horizontal-streak',
    properties: {
      step: 20,
      colors: ['#808080', '#ddd', '#ddd', '#ddd', '#ddd'],
    },
  },
  v1: {
    id: 'v1',
    type: 'vertical-streak',
    properties: {
      step: 20,
      colors: ['#808080', '#ddd', '#ddd', '#ddd', '#ddd'],
    },
  },
};

export const DEFAULT_SCENE: Scene = {
  unit: 'cm',
  layers: {
    'layer-1': { ...DEFAULT_LAYER },
  },
  grids: { ...DEFAULT_GRIDS },
  selectedLayer: 'layer-1',
  groups: {},
  width: 3000,
  height: 2000,
  meta: {},
  guides: {
    horizontal: {},
    vertical: {},
    circular: {},
  },
};

export const DEFAULT_CATALOG: CatalogState = {
  ready: false,
  page: 'root',
  path: [],
  elements: {},
};

export const DEFAULT_HISTORY: HistoryStructure = {
  past: [],
  future: [],
};

export const INITIAL_STATE: PlannerState = {
  mode: MODE_IDLE,
  overlays: [],
  scene: { ...DEFAULT_SCENE },
  sceneHistory: { ...DEFAULT_HISTORY },
  catalog: { ...DEFAULT_CATALOG },
  viewer2D: {},
  mouse: { x: 0, y: 0 },
  zoom: 0,
  snapMask: { ...DEFAULT_SNAP_MASK },
  snapElements: [],
  activeSnapElement: null,
  drawingSupport: {},
  draggingSupport: {},
  rotatingSupport: {},
  errors: [],
  warnings: [],
  clipboardProperties: {},
  selectedElementsHistory: [],
  misc: {},
  alterate: false,
};
