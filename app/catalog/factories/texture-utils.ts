import {
  TextureLoader,
  RepeatWrapping,
  Vector2,
} from "three";
import type { Material, Texture } from "three";
import type { TextureConfig } from "./types";

export const HALF_PI = Math.PI / 2;

const loader = new TextureLoader();

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

  loader.load(texture.uri, (loadedTexture: Texture) => {
    material.map = loadedTexture;
    material.needsUpdate = true;
    material.map.wrapS = RepeatWrapping;
    material.map.wrapT = RepeatWrapping;
    material.map.repeat.set(
      length * texture.lengthRepeatScale,
      height * texture.heightRepeatScale
    );
  });

  if (texture.normal) {
    const normal = texture.normal;
    loader.load(normal.uri, (loadedNormalMap: Texture) => {
      if (!loadedNormalMap) return;

      material.normalMap = loadedNormalMap;
      material.normalScale = new Vector2(
        normal.normalScaleX,
        normal.normalScaleY
      );
      material.normalMap.wrapS = RepeatWrapping;
      material.normalMap.wrapT = RepeatWrapping;
      material.normalMap.repeat.set(
        length * normal.lengthRepeatScale,
        height * normal.heightRepeatScale
      );
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
