"use client";

import { useState, useEffect, useRef } from "react";
import * as Three from "three";
import type { RuntimeCatalog, Scene, Layer } from "../../../store/types";

interface UseRender3DResult {
  object3D: Three.Object3D | null;
  isLoading: boolean;
}

export function useRender3D(
  type: string,
  element: unknown,
  layer: Layer,
  scene: Scene,
  catalog: RuntimeCatalog
): UseRender3DResult {
  const [object3D, setObject3D] = useState<Three.Object3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Stable dependency key based on element id and properties
  const elementId = (element as any).id;
  const propsKey = JSON.stringify((element as any).properties);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);

    const catalogElement = catalog.getElement(type);
    if (!catalogElement?.render3D) {
      setIsLoading(false);
      return;
    }

    catalogElement
      .render3D(element, layer, scene)
      .then((obj: unknown) => {
        if (mountedRef.current) {
          setObject3D(obj as Three.Object3D);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error(`useRender3D: failed to render ${type}:`, err);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, propsKey, type]);

  return { object3D, isLoading };
}
