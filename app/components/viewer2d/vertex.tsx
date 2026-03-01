"use client";

import React from "react";
import * as SharedStyle from "../../styles/shared-style";
import type { Vertex as VertexType, Layer } from "../../store/types";

interface VertexProps {
  vertex: VertexType;
  layer: Layer;
}

const STYLE: React.CSSProperties = {
  fill: "#0096fd",
  stroke: SharedStyle.COLORS.white,
  cursor: "move",
};

export const Vertex: React.FC<VertexProps> = ({ vertex, layer }) => {
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
