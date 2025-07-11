import {
  Shape,
  MeshPhongMaterial,
  ShapeGeometry,
  Box3,
  TextureLoader,
  BackSide,
  FrontSide,
  Object3D,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  Vector2,
  DoubleSide,
  BufferAttribute,
} from "three";
import * as SharedStyle from "../../styles/shared-style";

/**
 * Apply a texture to a wall face
 * @param material: The material of the face
 * @param texture: The texture to load
 * @param length: The length of the face
 * @param height: The height of the face
 */
/**
 * Apply a texture to a wall face
 * @param material: The material of the face
 * @param texture: The texture to load
 * @param length: The lenght of the face
 * @param height: The height of the face
 */
const applyTexture = (material, texture, length, height) => {
  let loader = new TextureLoader();

  if (texture) {
    loader.load(texture.uri, (loadedTexture) => {
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
      loader.load(texture.normal.uri, (loadedTexture) => {
        material.normalMap = loadedTexture;
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

/**
 * Function that assign UV coordinates to a geometry
 * @param geometry
 */
const assignUVs = (geometry) => {
  geometry.computeBoundingBox();

  let { min, max } = geometry.boundingBox;

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

export function createArea(element, layer, scene, textures) {
  let vertices = [];

  element.vertices.forEach((vertexID) => {
    vertices.push(layer.vertices.get(vertexID));
  });

  let textureName = element.properties.get("texture");
  let color = element.properties.get("patternColor");

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

  let areaMaterial = new MeshPhongMaterial({ side: DoubleSide, color });

  /* Create holes for the area */
  element.holes.forEach((holeID) => {
    let holeCoords = [];
    layer.getIn(["areas", holeID, "vertices"]).forEach((vertexID) => {
      let { x, y } = layer.getIn(["vertices", vertexID]);
      holeCoords.push([x, y]);
    });
    holeCoords = holeCoords.reverse();
    let holeShape = createShape(holeCoords);
    shape.holes.push(holeShape);
  });

  let shapeGeometry = new ShapeGeometry(shape);
  assignUVs(shapeGeometry);

  let boundingBox = new Box3().setFromObject(
    new Mesh(shapeGeometry, new MeshBasicMaterial())
  );

  let width = boundingBox.max.x - boundingBox.min.x;
  let height = boundingBox.max.y - boundingBox.min.y;

  let texture = textures[textureName];

  applyTexture(areaMaterial, texture, width, height);

  let area = new Mesh(shapeGeometry, areaMaterial);

  area.rotation.x -= Math.PI / 2;
  area.name = "floor";

  return Promise.resolve(area);
}

export function updatedArea(
  element,
  layer,
  scene,
  textures,
  mesh,
  oldElement,
  differences,
  selfDestroy,
  selfBuild
) {
  let noPerf = () => {
    selfDestroy();
    return selfBuild();
  };
  let floor = mesh.getObjectByName("floor");

  if (differences[0] === "selected") {
    let color = element.selected
      ? SharedStyle.AREA_MESH_COLOR.selected
      : element.properties.get("patternColor") ||
        SharedStyle.AREA_MESH_COLOR.unselected;
    floor.material.color.set(color);
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
const createShape = (shapeCoords) => {
  let shape = new Shape();
  shape.moveTo(shapeCoords[0][0], shapeCoords[0][1]);
  for (let i = 1; i < shapeCoords.length; i++) {
    shape.lineTo(shapeCoords[i][0], shapeCoords[i][1]);
  }
  return shape;
};
