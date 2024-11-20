"use client";

import React from "react";
import * as THREE from "three";
import { buildWall, updatedWall } from "./wall-factory-3d";
import * as Geometry from "../../utils/geometry";
import Translator from "../../translator/translator";
import * as SharedStyle from "../../styles/shared-style";

interface LengthMeasure {
  length: number;
}

interface WallProperties {
  height: {
    label: string;
    type: "length-measure";
    defaultValue: LengthMeasure;
  };
  thickness: {
    label: string;
    type: "length-measure";
    defaultValue: LengthMeasure;
  };
  textureA?: {
    label: string;
    type: "enum";
    defaultValue: string;
    values: Record<string, string>;
  };
  textureB?: {
    label: string;
    type: "enum";
    defaultValue: string;
    values: Record<string, string>;
  };
}

interface Vertex {
  x: number;
  y: number;
}

export interface Layer {
  vertices: Map<string, Vertex>;
  holes: Map<string, HoleData>;
}

export interface HoleData {
  properties: {
    getIn: (path: string[]) => number;
  };
  offset: number;
}

export interface Element {
  getIn: (path: string[]) => number;
  vertices: Map<number, string>;
  holes: string[];
  properties: {
    get: (key: string) => string;
    getIn: (path: string[]) => number;
  };
  selected: boolean;
}

export interface TextureData {
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

interface WallElement {
  name: string;
  prototype: "lines";
  info: unknown;
  properties: WallProperties;
  render2D: (element: Element, layer: Layer, scene: THREE.Scene) => JSX.Element;
  render3D: (
    element: Element,
    layer: Layer,
    scene: THREE.Scene
  ) => THREE.Mesh | Promise<THREE.Group>;
  updateRender3D: (
    element: Element,
    layer: Layer,
    scene: THREE.Scene,
    mesh: THREE.Mesh | THREE.Group,
    oldElement: Element,
    differences: string[],
    selfDestroy: () => void,
    selfBuild: () => Promise<THREE.Group<THREE.Object3DEventMap>>
  ) => THREE.Mesh | Promise<THREE.Group>;
}

const epsilon = 20;
const STYLE_TEXT: React.CSSProperties = { textAnchor: "middle" };
const STYLE_LINE: React.CSSProperties = {
  stroke: SharedStyle.LINE_MESH_COLOR.selected,
};
const STYLE_RECT: React.CSSProperties = {
  strokeWidth: 1,
  stroke: SharedStyle.LINE_MESH_COLOR.unselected,
  fill: "#292929",
};
const STYLE_RECT_SELECTED: React.CSSProperties = {
  ...STYLE_RECT,
  stroke: SharedStyle.LINE_MESH_COLOR.selected,
};

const translator = new Translator();

export default function WallFactory(
  name: string,
  info: unknown,
  textures?: Record<string, TextureData>
): WallElement {
  const wallElement: WallElement = {
    name,
    prototype: "lines",
    info,
    properties: {
      height: {
        label: translator.t("height"),
        type: "length-measure",
        defaultValue: {
          length: 300,
        },
      },
      thickness: {
        label: translator.t("thickness"),
        type: "length-measure",
        defaultValue: {
          length: 20,
        },
      },
    },

    render2D: (element, layer, scene) => {
      const vertex1 = layer.vertices.get(element.vertices.get(0)!);
      const vertex2 = layer.vertices.get(element.vertices.get(1)!);

      if (!vertex1 || !vertex2) return <></>;

      const length = Geometry.pointsDistance(
        vertex1.x,
        vertex1.y,
        vertex2.x,
        vertex2.y
      );
      const length_5 = length / 5;

      const thickness = element.getIn(["properties", "thickness", "length"]);
      const half_thickness = thickness / 2;
      const half_thickness_eps = half_thickness + epsilon;
      const char_height = 11;
      const extra_epsilon = 5;
      const textDistance = half_thickness + epsilon + extra_epsilon;

      return element.selected ? (
        <g>
          <rect
            x={0}
            y={-half_thickness}
            width={length}
            height={thickness}
            style={STYLE_RECT_SELECTED}
          />
          <line
            x1={length_5}
            y1={-half_thickness_eps}
            x2={length_5}
            y2={half_thickness_eps}
            style={STYLE_LINE}
          />
          <text x={length_5} y={textDistance + char_height} style={STYLE_TEXT}>
            A
          </text>
          <text x={length_5} y={-textDistance} style={STYLE_TEXT}>
            B
          </text>
        </g>
      ) : (
        <rect
          x={0}
          y={-half_thickness}
          width={length}
          height={thickness}
          style={STYLE_RECT}
        />
      );
    },

    render3D: (element, layer, scene) =>
      buildWall(element, layer, scene, textures),

    updateRender3D: (
      element,
      layer,
      scene,
      mesh,
      oldElement,
      differences,
      selfDestroy,
      selfBuild
    ) => {
      return updatedWall(
        element,
        layer,
        scene,
        textures,
        mesh,
        oldElement,
        differences,
        selfDestroy,
        selfBuild
      );
    },
  };

  if (textures && Object.keys(textures).length !== 0) {
    const textureValues: Record<string, string> = { none: "None" };

    for (const textureName in textures) {
      textureValues[textureName] = textures[textureName].name;
    }

    wallElement.properties.textureA = {
      label: translator.t("texture") + " A",
      type: "enum",
      defaultValue: textureValues.bricks ? "bricks" : "none",
      values: textureValues,
    };

    wallElement.properties.textureB = {
      label: translator.t("texture") + " B",
      type: "enum",
      defaultValue: textureValues.bricks ? "bricks" : "none",
      values: textureValues,
    };
  }

  return wallElement;
}
