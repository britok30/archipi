"use client";

import React, { useState, useCallback } from "react";
import * as Three from "three";
import { ThreeEvent } from "@react-three/fiber";
import CatalogElement3D from "./CatalogElement3D";
import type { RuntimeCatalog, Scene, Layer, Hole, Vertex } from "../../../store/types";

interface HoleElement3DProps {
  hole: Hole;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  onSelect: () => void;
}

const HoleElement3D: React.FC<HoleElement3DProps> = ({
  hole,
  layer,
  scene,
  catalog,
  onSelect,
}) => {
  const [position, setPosition] = useState<[number, number, number] | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  const line = layer.lines[hole.line];
  if (!line) return null;

  let vertex0: Vertex = layer.vertices[line.vertices[0]];
  let vertex1: Vertex = layer.vertices[line.vertices[1]];
  let offset = hole.offset;

  if (vertex0.x > vertex1.x) {
    const tmp = vertex0;
    vertex0 = vertex1;
    vertex1 = tmp;
    offset = 1 - offset;
  }

  const distance = Math.sqrt(
    Math.pow(vertex0.x - vertex1.x, 2) + Math.pow(vertex0.y - vertex1.y, 2)
  );
  const alpha = Math.asin((vertex1.y - vertex0.y) / distance);

  const onLoaded = useCallback(
    (object3D: Three.Object3D) => {
      // Wrap in a temp pivot to compute bounding box
      const pivot = new Three.Object3D();
      pivot.add(object3D);

      const boundingBox = new Three.Box3().setFromObject(pivot);
      const center = [
        (boundingBox.max.x - boundingBox.min.x) / 2 + boundingBox.min.x,
        (boundingBox.max.y - boundingBox.min.y) / 2 + boundingBox.min.y,
        (boundingBox.max.z - boundingBox.min.z) / 2 + boundingBox.min.z,
      ];

      // Remove from temp pivot so <primitive> can own it
      pivot.remove(object3D);

      const holeAltitude = (hole.properties as any)?.altitude?.length || 0;
      const holeHeight = (hole.properties as any)?.height?.length || 0;

      const posX =
        vertex0.x +
        distance * offset * Math.cos(alpha) -
        center[2] * Math.sin(alpha);
      const posY =
        holeAltitude + holeHeight / 2 - center[1] + layer.altitude;
      const posZ =
        -vertex0.y -
        distance * offset * Math.sin(alpha) -
        center[2] * Math.cos(alpha);

      setPosition([posX, posY, posZ]);
      setRotation(alpha);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hole.id, hole.offset, hole.line]
  );

  const opacity = hole.selected ? 1 : layer.opacity;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={position ?? [0, -10000, 0]}
      rotation={[0, rotation, 0]}
      visible={position !== null}
      onClick={handleClick}
    >
      <CatalogElement3D
        type={hole.type}
        element={hole}
        layer={layer}
        scene={scene}
        catalog={catalog}
        opacity={opacity}
        onLoaded={onLoaded}
      />
    </group>
  );
};

export default HoleElement3D;
