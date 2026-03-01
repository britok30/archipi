import * as Three from "three";

function disposeGeometry(geometry: Three.BufferGeometry): void {
  geometry.dispose();
}

function disposeTexture(texture: Three.Texture | null): void {
  if (!texture) {
    return;
  }
  texture.dispose();
}

function disposeMultimaterial(materials: Three.Material | Three.Material[]): void {
  if (Array.isArray(materials)) {
    // Handle an array of materials
    materials.forEach((material) => {
      disposeMaterial(material);
    });
  } else {
    // Handle a single material
    disposeMaterial(materials);
  }
}

function disposeMaterial(material: Three.Material): void {
  if (!(material instanceof Three.Material)) {
    return;
  }

  disposeTexture((material as any).map);
  (material as any).map = null;
  material.dispose();
}

function disposeMesh(mesh: Three.Object3D): void {
  if (
    !(
      mesh instanceof Three.Mesh ||
      mesh instanceof Three.BoxHelper ||
      mesh instanceof Three.LineSegments
    )
  ) {
    return;
  }
  disposeGeometry(mesh.geometry);
  disposeMultimaterial(mesh.material);
  disposeMaterial(mesh.material as Three.Material);

  (mesh as any).geometry = null;
  (mesh as any).material = null;
}

export function disposeScene(scene3D: Three.Scene | null): void {
  scene3D?.traverse((child: Three.Object3D) => {
    // disposeMesh(child);
    child = null as any;
  });
}

export function disposeObject(object: Three.Object3D): void {
  object.traverse((child: Three.Object3D) => {
    // disposeMesh(child);
    child = null as any;
  });
}
