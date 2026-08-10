"use client";

import * as Three from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Module-level cache of in-flight/completed GLTF loads so concurrent
 * render3D calls for the same model coalesce into a single fetch/parse.
 */
const gltfCache = new Map<string, Promise<GLTF>>();

const loader = new GLTFLoader();

function loadGltf(url: string): Promise<GLTF> {
  let cached = gltfCache.get(url);
  if (!cached) {
    cached = new Promise<GLTF>((resolve, reject) => {
      loader.load(url, resolve, undefined, (err) => {
        gltfCache.delete(url); // allow retry after a failed load
        reject(err);
      });
    });
    gltfCache.set(url, cached);
  }
  return cached;
}

/**
 * Load a GLB and return a deep clone of its scene with cloned geometries and
 * materials, so the caller owns a disposable object graph. Textures remain
 * shared across clones and are marked `userData.shared` so useRender3D's
 * dispose pass skips them.
 */
export async function loadGlb(url: string): Promise<Three.Object3D> {
  const gltf = await loadGltf(url);
  const clone = gltf.scene.clone(true);

  // clone(true) shares geometries/materials with the cached scene; give this
  // instance its own copies (each unique material/geometry cloned once).
  const materialClones = new Map<Three.Material, Three.Material>();
  const geometryClones = new Map<Three.BufferGeometry, Three.BufferGeometry>();

  const cloneMaterial = (material: Three.Material): Three.Material => {
    let copy = materialClones.get(material);
    if (!copy) {
      copy = material.clone();
      // Mark every texture map as shared so it survives disposal and keeps
      // serving future clones of the cached model.
      for (const value of Object.values(copy) as unknown[]) {
        if (value instanceof Three.Texture) {
          value.userData.shared = true;
        }
      }
      materialClones.set(material, copy);
    }
    return copy;
  };

  clone.traverse((child) => {
    const mesh = child as Three.Mesh;
    if (mesh.isMesh) {
      let geometryClone = geometryClones.get(mesh.geometry);
      if (!geometryClone) {
        geometryClone = mesh.geometry.clone();
        geometryClones.set(mesh.geometry, geometryClone);
      }
      mesh.geometry = geometryClone;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneMaterial)
        : cloneMaterial(mesh.material);
    }
  });

  return clone;
}

/**
 * Scale (non-uniformly) and translate `obj` so its bounding box exactly fills
 * the requested dimensions, sits on y = 0 and is centered on x/z = 0.
 * Dimensions are in scene units (cm). Assumes `obj` has identity transforms
 * (as returned by loadGlb).
 */
export function fitGlbToBox(
  obj: Three.Object3D,
  { width, height, depth }: { width: number; height: number; depth: number }
): Three.Object3D {
  const box = new Three.Box3().setFromObject(obj);
  const size = new Three.Vector3();
  box.getSize(size);

  const scaleX = size.x > 1e-6 ? width / size.x : 1;
  const scaleY = size.y > 1e-6 ? height / size.y : 1;
  const scaleZ = size.z > 1e-6 ? depth / size.z : 1;
  obj.scale.set(scaleX, scaleY, scaleZ);

  // Position applies after scale (T * R * S), so translate using the
  // pre-scale box mapped through the new scale factors.
  const centerX = (box.min.x + box.max.x) / 2;
  const centerZ = (box.min.z + box.max.z) / 2;
  obj.position.set(-centerX * scaleX, -box.min.y * scaleY, -centerZ * scaleZ);

  return obj;
}

/** Standard selection highlight matching the existing catalog items. */
export function addSelectionBox(obj: Three.Object3D): void {
  const bbox = new Three.BoxHelper(obj, 0x99c3fb);
  (bbox.material as Three.LineBasicMaterial).linewidth = 5;
  bbox.material.depthTest = false;
  bbox.renderOrder = 1000;
  obj.add(bbox);
}
