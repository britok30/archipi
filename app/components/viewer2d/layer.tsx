"use client";

import React from "react";
import { Map as ImmutableMap, List as ImmutableList } from "immutable";
import { Line } from "./line";
import { Area, CatalogType } from "./area";
import { Vertex } from "./vertex";
import { Item } from "./item";
import { Group } from "./group";

interface LayerProps {
  layer: LayerType;
  scene: SceneType;
  catalog: CatalogType;
}

interface LayerType {
  id: string;
  name: string;
  lines: ImmutableMap<string, any>;
  areas: ImmutableMap<string, any>;
  vertices: ImmutableMap<string, any>;
  items: ImmutableMap<string, any>;
  holes: ImmutableMap<string, any>; // Include holes if applicable
  opacity: number;
}

interface SceneType {
  unit: string;
  groups: ImmutableMap<string, any>;
  // Add other properties of scene if necessary
}

export const Layer: React.FC<LayerProps> = ({ layer, scene, catalog }) => {
  const { unit, groups } = scene;
  const {
    lines = ImmutableMap(),
    areas = ImmutableMap(),
    vertices = ImmutableMap(),
    items = ImmutableMap(),
    holes = ImmutableMap(),
    id: layerID,
    opacity,
  } = layer;

  return (
    <g opacity={opacity} data-layer-id={layerID}>
      {areas
        .valueSeq()
        .map((area: any) => (
          <Area
            key={area.get("id")}
            layer={layer}
            area={area}
            catalog={catalog}
          />
        ))
        .toArray()}
      {lines
        .valueSeq()
        .map((line: any) => (
          <Line
            key={line.get("id")}
            layer={layer}
            line={line}
            scene={scene}
            catalog={catalog}
          />
        ))
        .toArray()}
      {items
        .valueSeq()
        .map((item: any) => (
          <Item
            key={item.get("id")}
            layer={layer}
            item={item}
            scene={scene}
            catalog={catalog}
          />
        ))
        .toArray()}
      {vertices
        .valueSeq()
        .filter((v: any) => v.get("selected"))
        .map((vertex: any) => (
          <Vertex key={vertex.get("id")} layer={layer} vertex={vertex} />
        ))
        .toArray()}
      {groups
        .valueSeq()
        .filter((g: any) => g.hasIn(["elements", layerID]) && g.get("selected"))
        .map((group: any) => (
          <Group
            key={group.get("id")}
            layer={layer}
            group={group}
            scene={scene}
            catalog={catalog}
          />
        ))
        .toArray()}
    </g>
  );
};

export default Layer;
