"use client";

import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import CatalogElement3D from "./CatalogElement3D";
import type { RuntimeCatalog, Scene, Layer, Area } from "../../../store/types";

interface AreaElement3DProps {
  area: Area;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  onSelect: () => void;
}

const AreaElement3D: React.FC<AreaElement3DProps> = ({
  area,
  layer,
  scene,
  catalog,
  onSelect,
}) => {
  const opacity = area.selected ? 1 : layer.opacity;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group position={[0, layer.altitude, 0]} onClick={handleClick}>
      <CatalogElement3D
        type={area.type}
        element={area}
        layer={layer}
        scene={scene}
        catalog={catalog}
        opacity={opacity}
      />
    </group>
  );
};

export default AreaElement3D;
