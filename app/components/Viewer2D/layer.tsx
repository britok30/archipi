"use client";

import React from "react";
import PropTypes from "prop-types";
import { Line } from "./line";
import { Area } from "./area";
import { Vertex } from "./vertex";
import { Item } from "./item";
import { Group } from "./group";

export const Layer = ({ layer, scene, catalog }) => {
  let { unit, groups } = scene;
  let { lines, areas, vertices, id: layerID, items, opacity } = layer;

  // TODO(pg): add holes which should be the holes in areas like stairs or remove if
  // already taken into account in Area component in viewer2d/area.jsx
  return (
    <g opacity={opacity} data-layer-id={layer.id}>
      {areas.valueSeq().map((area) => (
        <Area
          key={area.id}
          layer={layer}
          area={area}
          unit={unit}
          catalog={catalog}
        />
      ))}
      {lines.valueSeq().map((line) => (
        <Line
          key={line.id}
          layer={layer}
          line={line}
          scene={scene}
          catalog={catalog}
        />
      ))}
      {items.valueSeq().map((item) => (
        <Item
          key={item.id}
          layer={layer}
          item={item}
          scene={scene}
          catalog={catalog}
        />
      ))}
      {vertices
        .valueSeq()
        .filter((v) => v.selected)
        .map((vertex) => (
          <Vertex key={vertex.id} layer={layer} vertex={vertex} />
        ))}
      {groups
        .valueSeq()
        .filter((g) => g.hasIn(["elements", layerID]) && g.get("selected"))
        .map((group) => (
          <Group
            key={group.get("id")}
            layer={layer}
            group={group}
            scene={scene}
            catalog={catalog}
          />
        ))}
    </g>
  );
};

Layer.propTypes = {
  layer: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired,
};
