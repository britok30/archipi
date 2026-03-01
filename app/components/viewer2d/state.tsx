"use client";

import React from "react";
import { Scene as SceneComponent } from "./scene";
import * as SharedStyle from "../../styles/shared-style";
import type { Scene, RuntimeCatalog } from "../../store/types";

const guideStyle = {
  stroke: SharedStyle.SECONDARY_COLOR.main,
  strokeWidth: "2.5px",
};

interface StateProps {
  scene: Scene;
  catalog: RuntimeCatalog | null;
}

export const State: React.FC<StateProps> = ({ scene, catalog }) => {
  const { width, height, guides } = scene;

  return (
    <g>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={SharedStyle.COLORS.grey}
      />
      <g
        transform={`translate(0, ${height}) scale(1, -1)`}
        id="svg-drawing-paper"
      >
        <SceneComponent scene={scene} catalog={catalog} />
        {/* Horizontal guides */}
        {Object.entries(guides.horizontal).map(([key, guide]) => (
          <line
            id={`hGuide${key}`}
            key={key}
            x1={0}
            y1={guide.y}
            x2={width}
            y2={guide.y}
            style={guideStyle}
          />
        ))}
        {/* Vertical guides */}
        {Object.entries(guides.vertical).map(([key, guide]) => (
          <line
            key={key}
            x1={guide.x}
            y1={0}
            x2={guide.x}
            y2={height}
            style={guideStyle}
          />
        ))}
      </g>
    </g>
  );
};

export default State;
