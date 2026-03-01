"use client";

import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import CatalogElement3D from "./CatalogElement3D";
import type { RuntimeCatalog, Scene, Layer, Line, Vertex } from "../../../store/types";

interface LineElement3DProps {
  line: Line;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  onSelect: () => void;
}

const LineElement3D: React.FC<LineElement3DProps> = ({
  line,
  layer,
  scene,
  catalog,
  onSelect,
}) => {
  let vertex0: Vertex = layer.vertices[line.vertices[0]];
  let vertex1: Vertex = layer.vertices[line.vertices[1]];

  if (vertex0.x > vertex1.x) {
    const tmp = vertex0;
    vertex0 = vertex1;
    vertex1 = tmp;
  }

  const opacity = line.selected ? 1 : layer.opacity;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={[vertex0.x, layer.altitude, -vertex0.y]}
      onClick={handleClick}
    >
      <CatalogElement3D
        type={line.type}
        element={line}
        layer={layer}
        scene={scene}
        catalog={catalog}
        opacity={opacity}
      />
    </group>
  );
};

export default LineElement3D;
