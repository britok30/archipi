"use client";

import React from "react";
import * as SharedStyle from "../../styles/shared-style";
import type { Vertex as VertexType, Layer } from "../../store/types";

interface VertexProps {
  vertex: VertexType;
  layer: Layer;
}

const STYLE: React.CSSProperties = {
  fill: SharedStyle.CANVAS.accent,
  stroke: SharedStyle.CANVAS.handleStroke,
  strokeWidth: 1.5,
  cursor: "move",
};

const VertexComponent: React.FC<VertexProps> = ({ vertex, layer }) => {
  let { x, y } = vertex;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      data-element-root
      data-prototype={vertex.prototype}
      data-id={vertex.id}
      data-selected={vertex.selected}
      data-layer={layer.id}
    >
      <circle cx="0" cy="0" r="7" style={STYLE} />
    </g>
  );
};

export const Vertex = React.memo(VertexComponent);
