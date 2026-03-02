"use client";

import React, { useMemo } from "react";
import createGrid from "@/lib/viewer3d/grid-creator";
import type { Scene } from "../../store/types";

interface Grid3DProps {
  scene: Scene;
}

const Grid3D: React.FC<Grid3DProps> = ({ scene }) => {
  const grid = useMemo(
    () => createGrid(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene.width, scene.height]
  );

  return <primitive object={grid} />;
};

export default Grid3D;
