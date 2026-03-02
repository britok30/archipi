"use client";

import React from "react";
import { GeometryUtils } from "../../../lib/floorplan-utils/export";
import { Ruler } from "./ruler";
import type {
  Line as LineType,
  Layer as LayerType,
  Scene as SceneType,
  RuntimeCatalog,
} from "../../store/types";

interface LineProps {
  line: LineType;
  layer: LayerType;
  scene: SceneType;
  catalog: RuntimeCatalog | null;
}

export const Line: React.FC<LineProps> = ({ line, layer, scene, catalog }) => {
  const vertex0 = layer.vertices[line.vertices[0]];
  const vertex1 = layer.vertices[line.vertices[1]];

  if (!vertex0 || !vertex1) return null;
  if (vertex0.id === vertex1.id || GeometryUtils.samePoints(vertex0, vertex1))
    return null; // avoid 0-length lines

  let { x: x1, y: y1 } = vertex0;
  let { x: x2, y: y2 } = vertex1;

  if (x1 > x2) {
    ({ x: x1, y: y1 } = vertex1);
    ({ x: x2, y: y2 } = vertex0);
  }

  const length = GeometryUtils.pointsDistance(x1, y1, x2, y2);
  const angle = GeometryUtils.angleBetweenTwoPointsAndOrigin(x1, y1, x2, y2);

  const renderedHoles = line.holes.map((holeID) => {
    const hole = layer.holes[holeID];
    if (!hole) return null;

    const startAt = length * hole.offset;
    const renderedHole = catalog
      ?.getElement(hole.type)
      ?.render2D?.(hole, layer, scene);

    return (
      <g
        key={holeID}
        transform={`translate(${startAt}, 0)`}
        data-element-root
        data-prototype={hole.prototype}
        data-id={hole.id}
        data-selected={hole.selected ? "true" : "false"}
        data-layer={layer.id}
      >
        {renderedHole}
      </g>
    );
  });

  const thickness =
    (line.properties.thickness as { length: number })?.length || 10;
  const half_thickness = thickness / 2;

  const renderedLine = catalog
    ?.getElement(line.type)
    ?.render2D?.(line, layer, scene);
  const renderedRuler = line.selected ? (
    <Ruler
      unit={scene.unit}
      length={length}
      transform={`translate(0, ${half_thickness + 10} )`}
    />
  ) : null;

  return (
    <g
      transform={`translate(${x1}, ${y1}) rotate(${angle}, 0, 0)`}
      data-element-root
      data-prototype={line.prototype}
      data-id={line.id}
      data-selected={line.selected ? "true" : "false"}
      data-layer={layer.id}
      style={line.selected ? { cursor: "move" } : {}}
    >
      {renderedRuler}
      {renderedLine}
      {renderedHoles}
    </g>
  );
};

export default Line;
