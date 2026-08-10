import {
  TextureLoader,
  RepeatWrapping,
  SRGBColorSpace,
  NoColorSpace,
  Vector2,
} from "three";
import type { Material, Texture } from "three";
import type { TextureConfig } from "./types";

export const HALF_PI = Math.PI / 2;

const loader = new TextureLoader();

/**
 * Module-level texture cache keyed by URI. Cached originals are marked
 * `userData.shared` so they are never disposed; consumers get lightweight
 * clones (sharing the underlying image) with their own repeat settings.
 */
const textureCache = new Map<string, Texture>();
const pendingLoads = new Map<string, Array<(texture: Texture) => void>>();

function loadSharedTexture(
  uri: string,
  onLoad: (texture: Texture) => void
): void {
  const cached = textureCache.get(uri);
  if (cached) {
    onLoad(cached);
    return;
  }

  const pending = pendingLoads.get(uri);
  if (pending) {
    pending.push(onLoad);
    return;
  }

  pendingLoads.set(uri, [onLoad]);
  loader.load(uri, (loadedTexture: Texture) => {
    loadedTexture.userData.shared = true;
    textureCache.set(uri, loadedTexture);
    const callbacks = pendingLoads.get(uri) || [];
    pendingLoads.delete(uri);
    callbacks.forEach((callback) => callback(loadedTexture));
  });
}

/** Clone a cached texture, sharing its image but with independent settings. */
function cloneSharedTexture(sharedTexture: Texture): Texture {
  const clone = sharedTexture.clone();
  clone.userData = { ...clone.userData, shared: false };
  clone.wrapS = RepeatWrapping;
  clone.wrapT = RepeatWrapping;
  clone.needsUpdate = true;
  return clone;
}

/**
 * Apply a texture (and optional normal map) to a material.
 * Works with any material that supports `map` and `normalMap`
 * (e.g. MeshStandardMaterial, MeshPhongMaterial).
 */
export const applyTexture = (
  material: Material,
  texture: TextureConfig | undefined,
  length: number,
  height: number
): void => {
  if (!texture) return;

  if (!hasMaps(material)) return;

  loadSharedTexture(texture.uri, (sharedTexture: Texture) => {
    const map = cloneSharedTexture(sharedTexture);
    map.colorSpace = SRGBColorSpace;
    map.repeat.set(
      length * texture.lengthRepeatScale,
      height * texture.heightRepeatScale
    );
    material.map = map;
    material.needsUpdate = true;
  });

  if (texture.normal) {
    const normal = texture.normal;
    loadSharedTexture(normal.uri, (sharedNormalMap: Texture) => {
      const normalMap = cloneSharedTexture(sharedNormalMap);
      normalMap.colorSpace = NoColorSpace;
      normalMap.repeat.set(
        length * normal.lengthRepeatScale,
        height * normal.heightRepeatScale
      );
      material.normalMap = normalMap;
      material.normalScale = new Vector2(
        normal.normalScaleX,
        normal.normalScaleY
      );
      material.needsUpdate = true;
    });
  }
};

/** Type guard for materials that support map/normalMap properties. */
function hasMaps(
  mat: Material
): mat is Material & {
  map: Texture | null;
  normalMap: Texture | null;
  normalScale: Vector2;
} {
  return "map" in mat && "normalMap" in mat;
}
