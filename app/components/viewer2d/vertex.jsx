"use client";

import React from "react";
import PropTypes from "prop-types";
import * as SharedStyle from "../../styles/shared-style";

const STYLE = {
  fill: "#0096fd",
  stroke: SharedStyle.COLORS.white,
  cursor: "move",
};

export const Vertex = ({ vertex, layer }) => {
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

Vertex.propTypes = {
  vertex: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
};
