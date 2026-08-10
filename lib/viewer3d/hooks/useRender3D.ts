"use client";

import { useState, useEffect, useRef } from "react";
import * as Three from "three";
import type { RuntimeCatalog, Scene, Layer } from "@/app/store/types";

interface UseRender3DResult {
  object3D: Three.Object3D | null;
  isLoading: boolean;
}

const TEXTURE_MAP_KEYS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "emissiveMap",
  "bumpMap",
  "displacementMap",
  "alphaMap",
  "lightMap",
  "specularMap",
] as const;

function disposeMaterial(material: Three.Material): void {
  TEXTURE_MAP_KEYS.forEach((key) => {
    const texture = (material as any)[key] as Three.Texture | null | undefined;
    // Skip textures shared via module-level caches (marked in texture-utils)
    if (texture && !texture.userData?.shared) {
      texture.dispose();
    }
  });
  material.dispose();
}

/** Dispose geometry, materials and their texture maps for an entire subtree. */
function disposeObject(object: Three.Object3D): void {
  object.traverse((child) => {
    const mesh = child as any;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (Array.isArray(mesh.material)) {
      (mesh.material as Three.Material[]).forEach(disposeMaterial);
    } else if (mesh.material) {
      disposeMaterial(mesh.material);
    }
  });
}

/**
 * Key capturing everything the rendered geometry depends on besides
 * element.properties: resolved vertex coordinates, holes (with their
 * offset/properties) and selection state.
 */
function buildGeometryKey(element: any, layer: Layer): string {
  const parts: string[] = [element.selected ? "1" : "0"];

  if (Array.isArray(element.vertices)) {
    element.vertices.forEach((vertexID: string) => {
      const vertex = layer.vertices[vertexID];
      parts.push(vertex ? `${vertex.x},${vertex.y}` : "?");
    });
  }

  if (Array.isArray(element.holes)) {
    element.holes.forEach((holeID: string) => {
      const hole = layer.holes[holeID];
      if (hole) {
        parts.push(
          `${holeID}:${hole.offset}:${JSON.stringify(hole.properties)}`
        );
        return;
      }
      // Area "holes" reference sub-areas; key on their vertex coordinates
      const subArea = (layer.areas as any)?.[holeID];
      if (subArea?.vertices) {
        parts.push(
          `${holeID}:` +
            subArea.vertices
              .map((vertexID: string) => {
                const vertex = layer.vertices[vertexID];
                return vertex ? `${vertex.x},${vertex.y}` : "?";
              })
              .join(";")
        );
      } else {
        parts.push(`${holeID}:?`);
      }
    });
  }

  return parts.join("|");
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
  const currentObjectRef = useRef<Three.Object3D | null>(null);

  // Stable dependency keys based on element id, properties and geometry inputs
  const elementId = (element as any).id;
  const propsKey = JSON.stringify((element as any).properties);
  const geometryKey = buildGeometryKey(element, layer);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    // Safe lookup: scenes can contain types missing from the current catalog
    // (legacy saves); render nothing rather than throwing inside the canvas.
    const catalogElement = catalog.getElementSafe(type);
    if (!catalogElement?.render3D) {
      setIsLoading(false);
      return;
    }

    catalogElement
      .render3D(element, layer, scene)
      .then((obj: unknown) => {
        const newObject = obj as Three.Object3D;
        if (cancelled) {
          // A newer render superseded this one; free the stale result
          disposeObject(newObject);
          return;
        }
        if (currentObjectRef.current && currentObjectRef.current !== newObject) {
          disposeObject(currentObjectRef.current);
        }
        currentObjectRef.current = newObject;
        setObject3D(newObject);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        console.error(`useRender3D: failed to render ${type}:`, err);
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, propsKey, geometryKey, type]);

  // Dispose the last object on unmount
  useEffect(() => {
    return () => {
      if (currentObjectRef.current) {
        disposeObject(currentObjectRef.current);
        currentObjectRef.current = null;
      }
    };
  }, []);

  return { object3D, isLoading };
}
