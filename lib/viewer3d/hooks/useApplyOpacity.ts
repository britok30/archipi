"use client";

import { useEffect } from "react";
import * as Three from "three";

interface MaterialWithMaxOpacity extends Three.Material {
  maxOpacity?: number;
}

function updateMaterialOpacity(
  material: MaterialWithMaxOpacity,
  opacity: number
): void {
  material.transparent = true;
  if (material.maxOpacity) {
    material.opacity = Math.min(material.maxOpacity, opacity);
  } else if (material.opacity && material.opacity > opacity) {
    material.maxOpacity = material.opacity;
    material.opacity = opacity;
  }
}

export function useApplyOpacity(
  object3D: Three.Object3D | null,
  opacity: number
): void {
  useEffect(() => {
    if (!object3D) return;

    object3D.traverse((child) => {
      const mesh = child as any;
      if (Array.isArray(mesh.material)) {
        (mesh.material as MaterialWithMaxOpacity[]).forEach((mat) =>
          updateMaterialOpacity(mat, opacity)
        );
      } else if (mesh.material) {
        updateMaterialOpacity(mesh.material as MaterialWithMaxOpacity, opacity);
      }
    });
  }, [object3D, opacity]);
}
