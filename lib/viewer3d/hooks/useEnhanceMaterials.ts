"use client";

import { useEffect } from "react";
import * as Three from "three";

function enhanceMaterial(material: any): void {
  if (material.map && material.map.anisotropy !== 16) {
    material.map.anisotropy = 16;
    material.map.needsUpdate = true;
  }
  material.envMapIntensity = 1.5;
  if (material.roughness === undefined) {
    material.roughness = 0.65;
  }
  if (material.metalness === undefined) {
    material.metalness = 0.1;
  }
}

export function useEnhanceMaterials(object3D: Three.Object3D | null): void {
  useEffect(() => {
    if (!object3D) return;

    object3D.traverse((node: any) => {
      if (Array.isArray(node.material)) {
        node.material.forEach(enhanceMaterial);
      } else if (node.material) {
        enhanceMaterial(node.material);
      }
    });
  }, [object3D]);
}
