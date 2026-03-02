"use client";

import { useEffect } from "react";
import * as Three from "three";

export function useEnhanceMaterials(object3D: Three.Object3D | null): void {
  useEffect(() => {
    if (!object3D) return;

    object3D.traverse((node: any) => {
      if (node.material) {
        if (node.material.map) {
          node.material.map.anisotropy = 16;
          node.material.map.needsUpdate = true;
        }
        node.material.shadowSide = true;
        node.material.envMapIntensity = 1.5;
        node.material.roughness = 0.65;
        node.material.metalness = 0.1;
        node.material.needsUpdate = true;
      }
    });
  }, [object3D]);
}
