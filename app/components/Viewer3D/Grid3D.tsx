"use client";

import React, { useState, useEffect } from "react";
import * as Three from "three";
import createGrid from "@/lib/viewer3d/grid-creator";
import type { Scene } from "../../store/types";

interface Grid3DProps {
  scene: Scene;
}

function disposeGrid(grid: Three.Object3D): void {
  grid.traverse((child) => {
    const mesh = child as any;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (Array.isArray(mesh.material)) {
      (mesh.material as Three.Material[]).forEach((mat) => mat.dispose());
    } else if (mesh.material) {
      (mesh.material as Three.Material).dispose();
    }
  });
}

const Grid3D: React.FC<Grid3DProps> = ({ scene }) => {
  const [grid, setGrid] = useState<Three.Object3D | null>(null);

  const gridsKey = JSON.stringify(scene.grids);

  useEffect(() => {
    const newGrid = createGrid(scene);
    setGrid(newGrid);
    return () => {
      disposeGrid(newGrid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.width, scene.height, gridsKey]);

  if (!grid) return null;

  return <primitive object={grid} />;
};

export default Grid3D;
