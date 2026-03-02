"use client";

import React from "react";
import * as Three from "three";
import { useRender3D } from "@/lib/viewer3d/hooks/useRender3D";
import { useApplyOpacity } from "@/lib/viewer3d/hooks/useApplyOpacity";
import { useEnhanceMaterials } from "@/lib/viewer3d/hooks/useEnhanceMaterials";
import type { RuntimeCatalog, Scene, Layer } from "../../../store/types";

interface CatalogElement3DProps {
  type: string;
  element: unknown;
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  opacity: number;
  onLoaded?: (object3D: Three.Object3D) => void;
}

const CatalogElement3D: React.FC<CatalogElement3DProps> = ({
  type,
  element,
  layer,
  scene,
  catalog,
  opacity,
  onLoaded,
}) => {
  const { object3D, isLoading } = useRender3D(type, element, layer, scene, catalog);
  useApplyOpacity(object3D, opacity);
  useEnhanceMaterials(object3D);

  React.useEffect(() => {
    if (object3D && onLoaded) {
      onLoaded(object3D);
    }
  }, [object3D, onLoaded]);

  if (isLoading || !object3D) return null;

  return <primitive object={object3D} />;
};

export default CatalogElement3D;
