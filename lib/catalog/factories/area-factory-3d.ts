import {
  Shape,
  ShapeGeometry,
  Box3,
  Object3D,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector2,
  DoubleSide,
  BufferAttribute,
} from "three";
import * as SharedStyle from "../../../app/styles/shared-style";
import type { Vertex } from "../../../app/store/types";
import { applyTexture, HALF_PI } from "./texture-utils";
import type { TextureConfig } from "./types";

/**
 * Function that assign UV coordinates to a geometry
 * @param geometry
 */
const assignUVs = (geometry: ShapeGeometry): void => {
  geometry.computeBoundingBox();

  let { min, max } = geometry.boundingBox!;

  let offset = new Vector2(0 - min.x, 0 - min.y);
  let range = new Vector2(max.x - min.x, max.y - min.y);

  const positions = geometry.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2); // Initialize a new array for UV coordinates

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    const uvx = (x + offset.x) / range.x;
    const uvy = (y + offset.y) / range.y;

    uvs[i * 2] = uvx;
    uvs[i * 2 + 1] = uvy;
  }

  // Update the geometry with the new UVs
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
};

export function createArea(
  element: any,
  layer: any,
  scene: any,
  textures: Record<string, TextureConfig>,
): Promise<Mesh> {
  let vertices: Vertex[] = [];

  element.vertices.forEach((vertexID: string) => {
    vertices.push(layer.vertices[vertexID]);
  });

  let textureName = element.properties?.texture as string | undefined;
  let color = element.properties?.patternColor as string | undefined;

  if (element.selected) {
    color = SharedStyle.AREA_MESH_COLOR.selected;
  } else if (textureName && textureName !== "none") {
    color = SharedStyle.AREA_MESH_COLOR.unselected;
  }

  let shape = new Shape();
  shape.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    shape.lineTo(vertices[i].x, vertices[i].y);
  }

  let areaMaterial = new MeshStandardMaterial({ side: DoubleSide, color });

  /* Create holes for the area */
  element.holes.forEach((holeID: string) => {
    let holeCoords: number[][] = [];
    (layer.areas[holeID]?.vertices || []).forEach((vertexID: string) => {
      let { x, y } = layer.vertices[vertexID];
      holeCoords.push([x, y]);
    });
    holeCoords = holeCoords.reverse();
    let holeShape = createShape(holeCoords);
    shape.holes.push(holeShape);
  });

  let shapeGeometry = new ShapeGeometry(shape);
  assignUVs(shapeGeometry);

  let boundingBox = new Box3().setFromObject(
    new Mesh(shapeGeometry, new MeshBasicMaterial()),
  );

  let width = boundingBox.max.x - boundingBox.min.x;
  let height = boundingBox.max.y - boundingBox.min.y;

  let texture = textureName ? textures[textureName] : undefined;

  applyTexture(areaMaterial, texture, width, height);

  let area = new Mesh(shapeGeometry, areaMaterial);

  area.rotation.x -= HALF_PI;
  area.name = "floor";

  return Promise.resolve(area);
}

export function updatedArea(
  element: any,
  layer: any,
  scene: any,
  textures: Record<string, TextureConfig>,
  mesh: Object3D,
  oldElement: any,
  differences: string[],
  selfDestroy: () => void,
  selfBuild: () => Promise<Object3D>,
): Promise<Object3D> {
  let noPerf = () => {
    selfDestroy();
    return selfBuild();
  };
  let floor = mesh.getObjectByName("floor") as Mesh | undefined;

  if (differences[0] === "selected") {
    let color = element.selected
      ? SharedStyle.AREA_MESH_COLOR.selected
      : (element.properties?.patternColor as string) ||
        SharedStyle.AREA_MESH_COLOR.unselected;
    if (floor) {
      (floor.material as MeshStandardMaterial).color.set(color);
    }
  } else if (differences[0] === "properties") {
    if (differences[1] === "texture") {
      return noPerf();
    }
  } else return noPerf();

  return Promise.resolve(mesh);
}

/**
 * This function will create a shape given a list of coordinates
 * @param shapeCoords
 * @returns {Shape}
 */
const createShape = (shapeCoords: number[][]): Shape => {
  let shape = new Shape();
  shape.moveTo(shapeCoords[0][0], shapeCoords[0][1]);
  for (let i = 1; i < shapeCoords.length; i++) {
    shape.lineTo(shapeCoords[i][0], shapeCoords[i][1]);
  }
  return shape;
};
