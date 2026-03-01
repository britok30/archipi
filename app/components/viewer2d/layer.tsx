"use client";

import React from "react";
import { Line } from "./line";
import { Area } from "./area";
import { Vertex } from "./vertex";
import { Item } from "./item";
import { Group } from "./group";
import type {
  Layer as LayerType,
  Scene as SceneType,
  RuntimeCatalog,
} from "../../store/types";

interface LayerProps {
  layer: LayerType;
  scene: SceneType;
  catalog: RuntimeCatalog | null;
}

export const Layer: React.FC<LayerProps> = ({ layer, scene, catalog }) => {
  const { unit, groups } = scene;
  const {
    lines = {},
    areas = {},
    vertices = {},
    items = {},
    holes = {},
    id: layerID,
    opacity,
  } = layer;

  return (
    <g opacity={opacity} data-layer-id={layerID}>
      {/* Render areas */}
      {Object.values(areas).map((area) => (
        <Area
          key={area.id}
          layer={layer}
          area={area}
          scene={scene}
          catalog={catalog}
        />
      ))}

      {/* Render lines */}
      {Object.values(lines).map((line) => (
        <Line
          key={line.id}
          layer={layer}
          line={line}
          scene={scene}
          catalog={catalog}
        />
      ))}

      {/* Render items */}
      {Object.values(items).map((item) => (
        <Item
          key={item.id}
          layer={layer}
          item={item}
          scene={scene}
          catalog={catalog}
        />
      ))}

      {/* Render selected vertices */}
      {Object.values(vertices)
        .filter((v) => v.selected)
        .map((vertex) => (
          <Vertex key={vertex.id} layer={layer} vertex={vertex} />
        ))}

      {/* Render selected groups */}
      {Object.values(groups)
        .filter((g) => g.elements[layerID] && g.selected)
        .map((group) => (
          <Group
            key={group.id}
            layer={layer}
            group={group}
            scene={scene}
            catalog={catalog}
          />
        ))}
    </g>
  );
};

export default Layer;
