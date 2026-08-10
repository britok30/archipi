"use client";

import { useEffect } from "react";
import * as Three from "three";

interface MaterialWithMaxOpacity extends Three.Material {
  maxOpacity?: number;
}

/**
 * Cloned cached models (Object3D.clone) share material references, so
 * mutating opacity in place would dim every instance and poison the cache.
 * Clone the material once per mesh before the first mutation.
 */
function ensureOwnMaterial(
  material: MaterialWithMaxOpacity
): MaterialWithMaxOpacity {
  if (material.userData.cloned) return material;
  const clone = material.clone() as MaterialWithMaxOpacity;
  clone.userData.cloned = true;
  return clone;
}

function updateMaterialOpacity(
  material: MaterialWithMaxOpacity,
  opacity: number
): void {
  if (material.maxOpacity === undefined) {
    material.maxOpacity = material.opacity ?? 1;
  }
  const effectiveOpacity = Math.min(material.maxOpacity, opacity);
  material.opacity = effectiveOpacity;
  // Only fully-opaque materials stay out of the transparent render pass
  material.transparent = effectiveOpacity < 1;
}

export function useApplyOpacity(
  object3D: Three.Object3D | null,
  opacity: number
): void {
  useEffect(() => {
    if (!object3D) return;

    // At full opacity on a pristine material there is nothing to change —
    // and cloning here would orphan async texture loads still targeting the
    // factory's original material (walls rendered white until next rebuild).
    const needsTouch = (mat: MaterialWithMaxOpacity) =>
      opacity < 1 || mat.userData.cloned || (mat.opacity ?? 1) < 1;

    object3D.traverse((child) => {
      const mesh = child as any;
      if (Array.isArray(mesh.material)) {
        if (!(mesh.material as MaterialWithMaxOpacity[]).some(needsTouch)) return;
        mesh.material = (mesh.material as MaterialWithMaxOpacity[]).map(
          ensureOwnMaterial
        );
        (mesh.material as MaterialWithMaxOpacity[]).forEach((mat) =>
          updateMaterialOpacity(mat, opacity)
        );
      } else if (mesh.material) {
        if (!needsTouch(mesh.material as MaterialWithMaxOpacity)) return;
        mesh.material = ensureOwnMaterial(
          mesh.material as MaterialWithMaxOpacity
        );
        updateMaterialOpacity(mesh.material as MaterialWithMaxOpacity, opacity);
      }
    });
  }, [object3D, opacity]);
}
