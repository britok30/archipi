import {
  TextureLoader,
  Mesh,
  RepeatWrapping,
  Vector2,
  BoxGeometry,
  MeshStandardMaterial,
  Group,
  Scene,
  Texture,
} from "three";

import { CSG } from "three-csg-ts";
import { verticesDistance } from "../../utils/geometry";
import * as SharedStyle from "../../styles/shared-style";
import { Element, Layer, TextureData } from "./WallFactory";

const halfPI = Math.PI / 2;

const applyTexture = (
  material: MeshStandardMaterial,
  texture: TextureData | undefined,
  length: number,
  height: number
): void => {
  const loader = new TextureLoader();

  if (texture) {
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
      loader.load(texture.normal.uri, (loadedNormalMap: Texture) => {
        if (!loadedNormalMap) return;

        material.normalMap = loadedNormalMap;
        material.normalScale = new Vector2(
          texture.normal.normalScaleX,
          texture.normal.normalScaleY
        );
        material.normalMap.wrapS = RepeatWrapping;
        material.normalMap.wrapT = RepeatWrapping;
        material.normalMap.repeat.set(
          length * texture.normal.lengthRepeatScale,
          height * texture.normal.heightRepeatScale
        );
      });
    }
  }
};

export function buildWall(
  element: Element,
  layer: Layer,
  scene: Scene,
  textures: Record<string, TextureData>
): Promise<Group> {
  let vertex0 = layer.vertices.get(element.vertices.get(0));
  let vertex1 = layer.vertices.get(element.vertices.get(1));
  let inverted = false;

  if (!vertex0 || !vertex1) {
    throw new Error("Vertices not found");
  }

  if (vertex0.x > vertex1.x) {
    [vertex0, vertex1] = [vertex1, vertex0];
    inverted = true;
  }

  const height = element.properties.getIn(["height", "length"]);
  const thickness = element.properties.getIn(["thickness", "length"]);
  const halfThickness = thickness / 2;
  const faceThickness = 0.2;
  const faceDistance = 1;

  const distance = verticesDistance(vertex0, vertex1);
  const halfDistance = distance / 2;

  const soulMaterial = new MeshStandardMaterial({
    color: element.selected ? SharedStyle.MESH_SELECTED : 0xd3d3d3,
  });
  let soul = new Mesh(
    new BoxGeometry(distance, height, thickness),
    soulMaterial
  );

  const alpha = Math.asin((vertex1.y - vertex0.y) / distance);
  const sinAlpha = Math.sin(alpha);
  const cosAlpha = Math.cos(alpha);

  soul.position.y += height / 2;
  soul.position.x += halfDistance * cosAlpha;
  soul.position.z -= halfDistance * sinAlpha;
  soul.rotation.y = alpha;

  element.holes.forEach((holeID) => {
    const holeData = layer.holes.get(holeID);
    if (!holeData) return;

    const holeWidth = holeData.properties.getIn(["width", "length"]);
    const holeHeight = holeData.properties.getIn(["height", "length"]);
    const holeAltitude = holeData.properties.getIn(["altitude", "length"]);
    const offset = inverted ? 1 - holeData.offset : holeData.offset;
    const holeDistance = offset * distance;

    const holeGeometry = new BoxGeometry(holeWidth, holeHeight, thickness);
    const holeMesh = new Mesh(holeGeometry);

    holeMesh.position.y += holeHeight / 2 + holeAltitude;
    holeMesh.position.x += holeDistance * cosAlpha;
    holeMesh.position.z -= holeDistance * sinAlpha;
    holeMesh.rotation.y = alpha;

    soul.updateMatrix();
    holeMesh.updateMatrix();

    const wallBSP = CSG.fromMesh(soul);
    const holeBSP = CSG.fromMesh(holeMesh);
    const wallWithHoleBSP = wallBSP.subtract(holeBSP);
    soul = CSG.toMesh(wallWithHoleBSP, soul.matrix, soulMaterial) as Mesh<
      BoxGeometry,
      MeshStandardMaterial
    >;
  });

  soul.name = "soul";

  const frontMaterial = new MeshStandardMaterial();
  const backMaterial = new MeshStandardMaterial();

  applyTexture(
    frontMaterial,
    textures[element.properties.get("textureB")],
    distance,
    height
  );
  applyTexture(
    backMaterial,
    textures[element.properties.get("textureA")],
    distance,
    height
  );

  const scaleFactor = faceThickness / thickness;
  const texturedFaceDistance = halfThickness + faceDistance;

  const frontFace = soul.clone();
  frontFace.material = frontMaterial;
  frontFace.scale.set(1, 1, scaleFactor);
  frontFace.position.x += texturedFaceDistance * Math.cos(alpha - halfPI);
  frontFace.position.z -= texturedFaceDistance * Math.sin(alpha - halfPI);
  frontFace.name = "frontFace";

  const backFace = soul.clone();
  backFace.material = backMaterial;
  backFace.scale.set(1, 1, scaleFactor);
  backFace.position.x += texturedFaceDistance * Math.cos(alpha + halfPI);
  backFace.position.z -= texturedFaceDistance * Math.sin(alpha + halfPI);
  backFace.name = "backFace";

  const merged = new Group();
  merged.add(soul, frontFace, backFace);

  return Promise.resolve(merged);
}

export function updatedWall(
  element: Element,
  layer: Layer,
  scene: Scene,
  textures: Record<string, TextureData>,
  mesh: Group | Mesh,
  oldElement: Element,
  differences: string[],
  selfDestroy: () => void,
  selfBuild: () => Promise<Group>
): Promise<Group> {
  const noPerf = () => {
    selfDestroy();
    return selfBuild();
  };

  const soul = mesh.getObjectByName("soul") as Mesh;
  const frontFace = mesh.getObjectByName("frontFace") as Mesh;
  const backFace = mesh.getObjectByName("backFace") as Mesh;

  if (!soul || !frontFace || !backFace) {
    return noPerf();
  }

  if (differences[0] === "selected") {
    soul.material = new MeshStandardMaterial({
      color: element.selected ? SharedStyle.MESH_SELECTED : 0xd3d3d3,
    });
  } else if (
    differences[0] === "properties" &&
    differences[1] === "thickness"
  ) {
    const newThickness = element.properties.getIn([
      "properties",
      "thickness",
      "length",
    ]);
    const oldThickness = oldElement.properties.getIn([
      "properties",
      "thickness",
      "length",
    ]);
    const halfNewThickness = newThickness / 2;
    const texturedFaceDistance = halfNewThickness + 1;
    const originalThickness = oldThickness / soul.scale.z;
    const alpha = soul.rotation.y;

    const xTemp = texturedFaceDistance * Math.cos(alpha - halfPI);
    const zTemp = texturedFaceDistance * Math.sin(alpha - halfPI);

    soul.scale.set(1, 1, newThickness / originalThickness);

    frontFace.position.x = soul.position.x + xTemp;
    frontFace.position.z = soul.position.z + zTemp;

    backFace.position.x = soul.position.x - xTemp;
    backFace.position.z = soul.position.z - zTemp;
  } else {
    return noPerf();
  }

  const result = mesh as Group;

  return Promise.resolve(result);
}
