import { TextureLoader, Texture } from "three";

let loader: TextureLoader | null = null;

/**
 * Safely load a texture, returning null during SSR.
 * Caches the TextureLoader instance for reuse.
 */
export function loadTexture(path: string): Texture | null {
  if (typeof window === "undefined") return null;
  if (!loader) loader = new TextureLoader();
  return loader.load(path);
}
