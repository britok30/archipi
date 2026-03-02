"use client";

import React, { useContext } from "react";
import * as sharedStyles from "../../styles/shared-style";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import type { Group as GroupType, Layer, Scene } from "../../store/types";

interface GroupProps {
  group: GroupType;
  layer: Layer;
  scene: Scene;
  catalog: unknown;
}

const cx = 0;
const cy = 0;
const radius = 5;

const STYLE_CIRCLE: React.CSSProperties = {
  fill: sharedStyles.MATERIAL_COLORS[500].orange,
  stroke: sharedStyles.MATERIAL_COLORS[500].orange,
  cursor: "default",
};

export const Group: React.FC<GroupProps> = ({ layer, group, scene, catalog }) => {
  const { translator } = useContext(ReactPlannerContext);

  return (
    <g
      data-element-root
      data-prototype={group.prototype}
      data-id={group.id}
      data-selected={group.selected}
      data-layer={layer.id}
      style={group.selected ? { cursor: "move" } : {}}
      transform={`translate(${group.x},${group.y}) rotate(${group.rotation})`}
    >
      {group.selected && (
        <g
          data-element-root
          data-prototype={group.prototype}
          data-id={group.id}
          data-selected={group.selected}
          data-layer={layer.id}
          data-part="rotation-anchor"
        >
          <circle cx={cx} cy={cy} r={radius} style={STYLE_CIRCLE}>
            <title>{translator?.t("Group's Barycenter")}</title>
          </circle>
        </g>
      )}
    </g>
  );
};
