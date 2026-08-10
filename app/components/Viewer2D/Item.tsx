"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import type { Item as ItemType, Layer, Scene, RuntimeCatalog } from "../../store/types";

interface ItemProps {
  item: ItemType;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog | null;
}

const STYLE_CIRCLE: React.CSSProperties = {
  fill: "#3B82F6",
  stroke: "#FFFFFF",
  strokeWidth: 1.5,
  cursor: "ew-resize",
};

const STYLE_CIRCLE2: React.CSSProperties = {
  fill: "none",
  stroke: "#3B82F6",
  strokeDasharray: "4 4",
  opacity: 0.6,
  cursor: "ew-resize",
};

const ItemComponent: React.FC<ItemProps> = ({ layer, item, scene, catalog }) => {
  const zoom = usePlannerStore((state) => state.zoom) || 1;
  let { x, y, rotation } = item;

  const catalogElement =
    catalog?.hasElement(item.type) ? catalog.getElement(item.type) : null;
  const renderedItem = catalogElement?.render2D?.(item, layer, scene);

  // Keep the rotation controls roughly constant-size on screen.
  const knobRadius = 10 / zoom;
  const guideRadius = 150 / zoom;

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
          <circle cx="0" cy={guideRadius} r={knobRadius} style={STYLE_CIRCLE} />
          <circle cx="0" cy="0" r={guideRadius} style={STYLE_CIRCLE2} />
        </g>
      )}
    </g>
  );
};

export const Item = React.memo(ItemComponent);
