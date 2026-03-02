export interface RenderElement {
  type: string;
  name: string;
  selected: boolean;
  rotation: number;
  properties: Record<string, any>;
  offset?: number;
  line?: string;
}

export interface CatalogElementDef {
  name: string;
  prototype: 'items' | 'lines' | 'holes' | 'areas';
  info: { title: string; tag: string[]; description: string; image: string };
  properties: Record<string, { label: string; type: string; defaultValue: unknown }>;
  render2D: (element: any, layer: any, scene: any) => React.ReactElement;
  render3D: (element: any, layer: any, scene: any) => Promise<any>;
  updateRender3D?: (
    element: any,
    layer: any,
    scene: any,
    mesh: any,
    oldElement: any,
    differences: string[],
    selfDestroy: () => void,
    selfBuild: () => Promise<any>
  ) => Promise<any>;
}
