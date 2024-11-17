"use client";

import React from "react";
import { createArea, updatedArea } from "./area-factory-3d";
import * as SharedStyle from "../../styles/shared-style";
import Translator from "../../translator/translator";
import { Mesh, Object3D } from "three";

interface Vertex {
  x: number;
  y: number;
}

interface TextureDefinition {
  name: string;
  uri: string;
  lengthRepeatScale: number;
  heightRepeatScale: number;
  normal?: {
    uri: string;
    normalScaleX: number;
    normalScaleY: number;
    lengthRepeatScale: number;
    heightRepeatScale: number;
  };
}

interface TextureMap {
  [key: string]: TextureDefinition;
}

interface AreaInfo {
  [key: string]: any;
}

interface PropertyDefinition {
  label: string;
  type: string;
  defaultValue: any;
  values?: { [key: string]: string };
}

interface AreaElement {
  name: string;
  prototype: string;
  info: {
    visibility: {
      catalog: boolean;
      layerElementsVisible: boolean;
    };
    [key: string]: any;
  };
  properties: {
    [key: string]: PropertyDefinition;
  };
  render2D: (element: any, layer: any, scene: any) => React.ReactElement;
  render3D: (element: any, layer: any, scene: any) => Promise<Mesh>;
  updateRender3D: (
    element: any,
    layer: any,
    scene: any,
    mesh: Object3D,
    oldElement: any,
    differences: string[],
    selfDestroy: () => void,
    selfBuild: () => Promise<Mesh>
  ) => Promise<Object3D>;
}

interface Layer {
  vertices: Map<string, Vertex>;
  areas: Map<string, any>;
}

const translator = new Translator();

export default function AreaFactory(
  name: string,
  info: AreaInfo,
  textures?: TextureMap
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
        label: translator.t("color"),
        type: "color",
        defaultValue: SharedStyle.AREA_MESH_COLOR.unselected,
      },
      thickness: {
        label: translator.t("thickness"),
        type: "length-measure",
        defaultValue: {
          length: 0,
        },
      },
    },
    render2D: function (
      element: any,
      layer: Layer,
      scene: any
    ): React.ReactElement {
      let path = "";

      // Print area path
      element.vertices.forEach((vertexID: string, ind: number) => {
        const vertex = layer.vertices.get(vertexID);
        if (vertex) {
          path += (ind ? "L" : "M") + vertex.x + " " + vertex.y + " ";
        }
      });

      // Add holes
      element.holes.forEach((areaID: string) => {
        const area = layer.areas.get(areaID);
        if (area) {
          [...area.vertices]
            .reverse()
            .forEach((vertexID: string, ind: number) => {
              const vertex = layer.vertices.get(vertexID);
              if (vertex) {
                path += (ind ? "L" : "M") + vertex.x + " " + vertex.y + " ";
              }
            });
        }
      });

      const fill = element.selected
        ? SharedStyle.AREA_MESH_COLOR.selected
        : element.properties.get("patternColor");

      return <path d={path} fill={fill} />;
    },

    render3D: function (element: any, layer: any, scene: any) {
      return createArea(element, layer, scene, textures || {});
    },

    updateRender3D: (
      element: any,
      layer: any,
      scene: any,
      mesh: Object3D,
      oldElement: any,
      differences: string[],
      selfDestroy: () => void,
      selfBuild: () => Promise<Mesh>
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
        selfBuild
      );
    },
  };

  if (textures && Object.keys(textures).length !== 0) {
    const textureValues: { [key: string]: string } = { none: "None" };

    for (const textureName in textures) {
      textureValues[textureName] = textures[textureName].name;
    }

    areaElement.properties.texture = {
      label: translator.t("texture"),
      type: "enum",
      defaultValue: "none",
      values: textureValues,
    };
  }

  return areaElement;
}
