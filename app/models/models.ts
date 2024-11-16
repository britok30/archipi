import { Record as ImmutableRecord, List, Map, fromJS } from 'immutable';
import { MODE_IDLE } from '../utils/constants';
import { SNAP_MASK } from '../utils/snap';

// Helper function to safely load map lists with a default value
function safeLoadMapList<T>(
  mapList: any,
  Model: new (json?: any) => T,
  defaultMap?: Map<string, T>
): Map<string, T> {
  return mapList
    ? Map(mapList).map((m: any) => new Model(m)).toMap() as Map<string, T>
    : defaultMap || Map<string, T>();
}

// Shared attributes interface
interface SharedAttributes {
  id: string;
  type: string;
  prototype: string;
  name: string;
  misc: Map<string, any>;
  selected: boolean;
  properties: Map<string, any>;
  visible: boolean;
}

const defaultSharedAttributes: SharedAttributes = {
  id: '',
  type: '',
  prototype: '',
  name: '',
  misc: Map<string, any>(),
  selected: false,
  properties: Map<string, any>(),
  visible: true,
};

// Grid class
interface GridProps {
  id: string;
  type: string;
  properties: Map<string, any>;
}

const defaultGridProps: GridProps = {
  id: '',
  type: '',
  properties: Map<string, any>(),
};

export class Grid extends ImmutableRecord(defaultGridProps) {
  constructor(json: Partial<GridProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
    });
  }
}

export const DefaultGrids: Map<string, Grid> = Map({
  h1: new Grid({
    id: 'h1',
    type: 'horizontal-streak',
    properties: Map({
      step: 20,
      colors: List(['#808080', '#ddd', '#ddd', '#ddd', '#ddd']),
    }),
  }),
  v1: new Grid({
    id: 'v1',
    type: 'vertical-streak',
    properties: Map({
      step: 20,
      colors: List(['#808080', '#ddd', '#ddd', '#ddd', '#ddd']),
    }),
  }),
});

// ElementsSet class
interface ElementsSetProps {
  vertices: List<string>;
  lines: List<string>;
  holes: List<string>;
  areas: List<string>;
  items: List<string>;
}

const defaultElementsSetProps: ElementsSetProps = {
  vertices: List<string>(),
  lines: List<string>(),
  holes: List<string>(),
  areas: List<string>(),
  items: List<string>(),
};

export class ElementsSet extends ImmutableRecord(defaultElementsSetProps) {
  constructor(json: Partial<ElementsSetProps> = {}) {
    super({
      vertices: List(json.vertices || []),
      lines: List(json.lines || []),
      holes: List(json.holes || []),
      areas: List(json.areas || []),
      items: List(json.items || []),
    });
  }
}

// Vertex class
interface VertexProps extends SharedAttributes {
  x: number;
  y: number;
  lines: List<string>;
  areas: List<string>;
}

const defaultVertexProps: VertexProps = {
  ...defaultSharedAttributes,
  x: -1,
  y: -1,
  prototype: 'vertices',
  lines: List<string>(),
  areas: List<string>(),
};

export class Vertex extends ImmutableRecord(defaultVertexProps) {
  constructor(json: Partial<VertexProps> = {}) {
    super({
      ...json,
      lines: List(json.lines || []),
      areas: List(json.areas || []),
    });
  }
}

// Line class
interface LineProps extends SharedAttributes {
  vertices: List<string>;
  holes: List<string>;
}

const defaultLineProps: LineProps = {
  ...defaultSharedAttributes,
  prototype: 'lines',
  vertices: List<string>(),
  holes: List<string>(),
};

export class Line extends ImmutableRecord(defaultLineProps) {
  constructor(json: Partial<LineProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
      vertices: List(json.vertices || []),
      holes: List(json.holes || []),
    });
  }
}

// Hole class
interface HoleProps extends SharedAttributes {
  offset: number;
  line: string;
}

const defaultHoleProps: HoleProps = {
  ...defaultSharedAttributes,
  prototype: 'holes',
  offset: -1,
  line: '',
};

export class Hole extends ImmutableRecord(defaultHoleProps) {
  constructor(json: Partial<HoleProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
    });
  }
}

// Area class
interface AreaProps extends SharedAttributes {
  vertices: List<string>;
  holes: List<string>;
}

const defaultAreaProps: AreaProps = {
  ...defaultSharedAttributes,
  prototype: 'areas',
  vertices: List<string>(),
  holes: List<string>(),
};

export class Area extends ImmutableRecord(defaultAreaProps) {
  constructor(json: Partial<AreaProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
      vertices: List(json.vertices || []),
      holes: List(json.holes || []),
    });
  }
}

// Item class
interface ItemProps extends SharedAttributes {
  x: number;
  y: number;
  rotation: number;
}

const defaultItemProps: ItemProps = {
  ...defaultSharedAttributes,
  prototype: 'items',
  x: 0,
  y: 0,
  rotation: 0,
};

export class Item extends ImmutableRecord(defaultItemProps) {
  constructor(json: Partial<ItemProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
    });
  }
}

// Layer class
interface LayerProps {
  id: string;
  altitude: number;
  order: number;
  opacity: number;
  name: string;
  visible: boolean;
  vertices: Map<string, Vertex>;
  lines: Map<string, Line>;
  holes: Map<string, Hole>;
  areas: Map<string, Area>;
  items: Map<string, Item>;
  selected: ElementsSet;
}

const defaultLayerProps: LayerProps = {
  id: '',
  altitude: 0,
  order: 0,
  opacity: 1,
  name: '',
  visible: true,
  vertices: Map<string, Vertex>(),
  lines: Map<string, Line>(),
  holes: Map<string, Hole>(),
  areas: Map<string, Area>(),
  items: Map<string, Item>(),
  selected: new ElementsSet(),
};

export class Layer extends ImmutableRecord(defaultLayerProps) {
  constructor(json: Partial<LayerProps> = {}) {
    super({
      ...json,
      vertices: safeLoadMapList(json.vertices, Vertex),
      lines: safeLoadMapList(json.lines, Line),
      holes: safeLoadMapList(json.holes, Hole),
      areas: safeLoadMapList(json.areas, Area),
      items: safeLoadMapList(json.items, Item),
      selected: new ElementsSet(json.selected),
    });
  }
}

export const DefaultLayers: Map<string, Layer> = Map({
  'layer-1': new Layer({ id: 'layer-1', name: 'default' }),
});

// Group class
interface GroupProps extends SharedAttributes {
  x: number;
  y: number;
  rotation: number;
  elements: Map<string, any>;
}

const defaultGroupProps: GroupProps = {
  ...defaultSharedAttributes,
  prototype: 'groups',
  x: 0,
  y: 0,
  rotation: 0,
  elements: Map<string, any>(),
};

export class Group extends ImmutableRecord(defaultGroupProps) {
  constructor(json: Partial<GroupProps> = {}) {
    super({
      ...json,
      properties: fromJS(json.properties || {}),
      elements: fromJS(json.elements || {}),
    });
  }
}

// Scene class
interface SceneProps {
  unit: string;
  layers: Map<string, Layer>;
  grids: Map<string, Grid>;
  selectedLayer: string | null;
  groups: Map<string, Group>;
  width: number;
  height: number;
  meta: Map<string, any>;
  guides: Map<string, any>;
}

const defaultSceneProps: SceneProps = {
  unit: 'cm',
  layers: Map<string, Layer>(),
  grids: Map<string, Grid>(),
  selectedLayer: null,
  groups: Map<string, Group>(),
  width: 3000,
  height: 2000,
  meta: Map<string, any>(),
  guides: Map({
    horizontal: Map<string, any>(),
    vertical: Map<string, any>(),
    circular: Map<string, any>(),
  }),
};

export class Scene extends ImmutableRecord(defaultSceneProps) {
  constructor(json: Partial<SceneProps> = {}) {
    const layers = safeLoadMapList(json.layers, Layer, DefaultLayers);

    super({
      ...json,
      grids: safeLoadMapList(json.grids, Grid, DefaultGrids),
      layers,
      selectedLayer: layers.first()?.id || null,
      groups: safeLoadMapList(json.groups || {}, Group),
      meta: json.meta ? fromJS(json.meta) : Map<string, any>(),
      guides: json.guides
        ? fromJS(json.guides)
        : Map({
            horizontal: Map<string, any>(),
            vertical: Map<string, any>(),
            circular: Map<string, any>(),
          }),
    });
  }
}

// CatalogElement class
interface CatalogElementProps {
  name: string;
  prototype: string;
  info: Map<string, any>;
  properties: Map<string, any>;
}

const defaultCatalogElementProps: CatalogElementProps = {
  name: '',
  prototype: '',
  info: Map<string, any>(),
  properties: Map<string, any>(),
};

export class CatalogElement extends ImmutableRecord(defaultCatalogElementProps) {
  constructor(json: Partial<CatalogElementProps> = {}) {
    super({
      ...json,
      info: fromJS(json.info || {}),
      properties: fromJS(json.properties || {}),
    });
  }
}

// Catalog class
interface CatalogProps {
  ready: boolean;
  page: string;
  path: List<string>;
  elements: Map<string, CatalogElement>;
}

const defaultCatalogProps: CatalogProps = {
  ready: false,
  page: 'root',
  path: List<string>(),
  elements: Map<string, CatalogElement>(),
};

export class Catalog extends ImmutableRecord(defaultCatalogProps) {
  constructor(json: Partial<CatalogProps> = {}) {
    const elements = safeLoadMapList(json.elements, CatalogElement);
    super({
      elements,
      ready: !elements.isEmpty(),
    });
  }

  factoryElement(
    type: string,
    options: any,
    initialProperties?: Map<string, any>
  ): Line | Hole | Area | Item {
    if (!this.elements.has(type)) {
      const catList = this.elements.map((element) => element.name).toArray();
      throw new Error(`Element ${type} does not exist in catalog ${catList}`);
    }

    const element = this.elements.get(type)!;
    const properties = element.properties.map((value, key) =>
      initialProperties && initialProperties.has(key)
        ? initialProperties.get(key)
        : value.get('defaultValue')
    );

    switch (element.prototype) {
      case 'lines':
        return new Line(options).merge({ properties }) as Line;

      case 'holes':
        return new Hole(options).merge({ properties }) as Hole;

      case 'areas':
        return new Area(options).merge({ properties }) as Area;

      case 'items':
        return new Item(options).merge({ properties }) as Item;

      default:
        throw new Error('Prototype not valid');
    }
  }
}

// HistoryStructure class
interface HistoryStructureProps {
  undoList: List<Scene>;
  redoList: List<Scene>;
  first: Scene | null;
  last: Scene | null;
}

const defaultHistoryStructureProps: HistoryStructureProps = {
  undoList: List<Scene>(),
  redoList: List<Scene>(),
  first: null,
  last: null,
};

export class HistoryStructure extends ImmutableRecord(defaultHistoryStructureProps) {
  constructor(json: any = {}) {
    super({
      undoList: fromJS(json.undoList || []),
      redoList: fromJS(json.redoList || []),
      first: json.scene ? new Scene(json.scene) : null,
      last: json.last ? new Scene(json.last) : json.scene ? new Scene(json.scene) : null,
    });
  }
}

// State class
export interface StateProps {
  mode: string;
  overlays: List<any>;
  scene: Scene;
  sceneHistory: HistoryStructure;
  catalog: Catalog;
  viewer2D: Map<string, any>;
  mouse: Map<string, number>;
  zoom: number;
  snapMask: number;
  snapElements: List<any>;
  activeSnapElement: any;
  drawingSupport: Map<string, any>;
  draggingSupport: Map<string, any>;
  rotatingSupport: Map<string, any>;
  errors: List<any>;
  warnings: List<any>;
  clipboardProperties: Map<string, any>;
  selectedElementsHistory: List<any>;
  misc: Map<string, any>;
  alterate: boolean;
}

const defaultStateProps: StateProps = {
  mode: MODE_IDLE,
  overlays: List<any>(),
  scene: new Scene(),
  sceneHistory: new HistoryStructure(),
  catalog: new Catalog(),
  viewer2D: Map<string, any>(),
  mouse: Map({ x: 0, y: 0 }),
  zoom: 0,
  snapMask: SNAP_MASK,
  snapElements: List<any>(),
  activeSnapElement: null,
  drawingSupport: Map<string, any>(),
  draggingSupport: Map<string, any>(),
  rotatingSupport: Map<string, any>(),
  errors: List<any>(),
  warnings: List<any>(),
  clipboardProperties: Map<string, any>(),
  selectedElementsHistory: List<any>(),
  misc: Map<string, any>(),
  alterate: false,
};

export class State extends ImmutableRecord(defaultStateProps) {
  constructor(json: Partial<StateProps> = {}) {
    super({
      ...json,
      scene: new Scene(json.scene),
      sceneHistory: new HistoryStructure(json),
      catalog: new Catalog(json.catalog || {}),
      viewer2D: Map(json.viewer2D || {}),
      drawingSupport: Map(json.drawingSupport || {}),
      draggingSupport: Map(json.draggingSupport || {}),
      rotatingSupport: Map(json.rotatingSupport || {}),
      misc: json.misc ? fromJS(json.misc) : Map<string, any>(),
    });
  }
}
