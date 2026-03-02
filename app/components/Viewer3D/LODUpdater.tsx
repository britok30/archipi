"use client";

import { useFrame } from "@react-three/fiber";
import * as Three from "three";

const LODUpdater: React.FC = () => {
  useFrame(({ camera, scene }) => {
    scene.traverse((child) => {
      if (child instanceof Three.LOD) {
        child.update(camera);
      }
    });
  });

  return null;
};

export default LODUpdater;
