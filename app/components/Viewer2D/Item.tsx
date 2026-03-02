"use client";

import React from "react";
import type { Item as ItemType, Layer, Scene, RuntimeCatalog } from "../../store/types";

interface ItemProps {
  item: ItemType;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog | null;
}

const STYLE_LINE: React.CSSProperties = {
  fill: "#0096fd",
  stroke: "#0096fd",
};

const STYLE_CIRCLE: React.CSSProperties = {
  fill: "#0096fd",
  stroke: "#0096fd",
  cursor: "ew-resize",
};

const STYLE_CIRCLE2: React.CSSProperties = {
  fill: "none",
  stroke: "#0096fd",
  cursor: "ew-resize",
};

export const Item: React.FC<ItemProps> = ({ layer, item, scene, catalog }) => {
  let { x, y, rotation } = item;

  let renderedItem = catalog?.getElement(item.type).render2D?.(item, layer, scene);

  return (
    <g
      data-element-root
      data-prototype={item.prototype}
      data-id={item.id}
      data-selected={item.selected}
      data-layer={layer.id}
      style={item.selected ? { cursor: "move" } : {}}
      transform={`translate(${x},${y}) rotate(${rotation})`}
    >
      {renderedItem}
      {item.selected && (
        <g
          data-element-root
          data-prototype={item.prototype}
          data-id={item.id}
          data-selected={item.selected}
          data-layer={layer.id}
          data-part="rotation-anchor"
        >
          <circle cx="0" cy="150" r="10" style={STYLE_CIRCLE} />
          <circle cx="0" cy="0" r="150" style={STYLE_CIRCLE2} />
        </g>
      )}
    </g>
  );
};
