"use client";

import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import CatalogElement3D from "./CatalogElement3D";
import type { RuntimeCatalog, Scene, Layer, Item } from "../../../store/types";

interface ItemElement3DProps {
  item: Item;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  onSelect: () => void;
}

const ItemElement3D: React.FC<ItemElement3DProps> = ({
  item,
  layer,
  scene,
  catalog,
  onSelect,
}) => {
  const opacity = item.selected ? 1 : layer.opacity;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={[item.x, layer.altitude, -item.y]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={handleClick}
    >
      <CatalogElement3D
        type={item.type}
        element={item}
        layer={layer}
        scene={scene}
        catalog={catalog}
        opacity={opacity}
      />
    </group>
  );
};

export default ItemElement3D;
