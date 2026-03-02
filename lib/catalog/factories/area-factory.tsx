import React from "react";
import { createArea, updatedArea } from "./area-factory-3d";
import * as SharedStyle from "../../../app/styles/shared-style";
import { Object3D, Mesh } from "three";
import type { TextureConfig } from "./types";

interface Vertex {
  x: number;
  y: number;
}

interface AreaInfo {
  visibility?: {
    catalog: boolean;
    layerElementsVisible: boolean;
  };
  [key: string]: any;
}

interface Element {
  selected: boolean;
  vertices: string[];
  holes: string[];
  properties: Record<string, any>;
}

export interface Layer {
  vertices: Record<string, Vertex>;
  areas: Record<string, { vertices: string[] }>;
}

interface PropertyDefinition {
  label: string;
  type: string;
  defaultValue: any;
  values?: Record<string, string>;
}

interface AreaElement {
  name: string;
  prototype: string;
  info: AreaInfo;
  properties: {
    [key: string]: PropertyDefinition;
  };
  render2D: (element: Element, layer: Layer, scene: any) => React.ReactElement;
  render3D: (element: Element, layer: Layer, scene: Object3D) => Promise<Mesh>;
  updateRender3D: (
    element: Element,
    layer: Layer,
    scene: Object3D,
    mesh: Object3D,
    oldElement: Element,
    differences: string[],
    selfDestroy: () => void,
    selfBuild: () => Promise<Mesh>,
  ) => Promise<Object3D>;
}


export default function AreaFactory(
  name: string,
  info: AreaInfo,
  textures?: Record<string, TextureConfig>,
): AreaElement {
  const areaElement: AreaElement = {
    name,
    prototype: "areas",
    info: {
      ...info,
      visibility: {
        catalog: false,
        layerElementsVisible: false,
      },
    },
    properties: {
      patternColor: {
        label: "color",
        type: "color",
        defaultValue: SharedStyle.AREA_MESH_COLOR.unselected,
      },
      thickness: {
        label: "thickness",
        type: "length-measure",
        defaultValue: {
          length: 0,
        },
      },
    },
    render2D: function (element: Element, layer: Layer, scene: any) {
      let path = "";

      // Print area path
      element.vertices.forEach((vertexID, ind) => {
        const vertex = layer.vertices[vertexID];
        if (vertex) {
          path += (ind ? "L" : "M") + vertex.x + " " + vertex.y + " ";
        }
      });

      // Add holes
      element.holes.forEach((areaID) => {
        const area = layer.areas[areaID];
        if (area) {
          [...area.vertices].reverse().forEach((vertexID, ind) => {
            const vertex = layer.vertices[vertexID];
            if (vertex) {
              path += (ind ? "L" : "M") + vertex.x + " " + vertex.y + " ";
            }
          });
        }
      });

      const fill = element.selected
        ? SharedStyle.AREA_MESH_COLOR.selected
        : element.properties?.patternColor;

      return <path d={path} fill={fill} />;
    },

    render3D: function (element: Element, layer: Layer, scene: Object3D) {
      return createArea(element, layer, scene, textures || {});
    },

    updateRender3D: (
      element: Element,
      layer: Layer,
      scene: Object3D,
      mesh: Object3D,
      oldElement: Element,
      differences: string[],
      selfDestroy: () => void,
      selfBuild: () => Promise<Mesh>,
    ) => {
      return updatedArea(
        element,
        layer,
        scene,
        textures || {},
        mesh,
        oldElement,
        differences,
        selfDestroy,
        selfBuild,
      );
    },
  };

  if (textures && Object.keys(textures).length > 0) {
    const textureValues: Record<string, string> = { none: "None" };

    for (const textureName in textures) {
      textureValues[textureName] = textures[textureName].name;
    }

    areaElement.properties.texture = {
      label: "texture",
      type: "enum",
      defaultValue: "none",
      values: textureValues,
    };
  }

  return areaElement;
}
