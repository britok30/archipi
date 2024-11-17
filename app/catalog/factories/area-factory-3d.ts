import {
  Shape,
  MeshPhongMaterial,
  ShapeGeometry,
  Box3,
  TextureLoader,
  Mesh,
  MeshBasicMaterial,
  Vector2,
  DoubleSide,
  BufferAttribute,
  Texture,
  Material,
  Scene,
  Object3D,
  RepeatWrapping,
} from "three";
import * as SharedStyle from "../../styles/shared-style";

interface TextureDefinition {
  uri: string;
  lengthRepeatScale: number;
  heightRepeatScale: number;
  normal?: {
    uri: string;
    normalScaleX: number;
    normalScaleY: number;
    lengthRepeatScale: number;
    heightRepeatScale: number;
  };
}

interface Vertex {
  x: number;
  y: number;
}

interface Element {
  vertices: string[];
  selected: boolean;
  holes: string[];
  properties: Map<string, any>;
}

interface Layer {
  vertices: Map<string, Vertex>;
  getIn: (path: string[]) => any;
}

type TextureMap = {
  [key: string]: TextureDefinition;
};

/**
 * Apply a texture to a wall face
 */
const applyTexture = (
  material: MeshPhongMaterial,
  texture: TextureDefinition | undefined,
  length: number,
  height: number
): void => {
  const loader = new TextureLoader();

  if (texture) {
    loader.load(texture.uri, (loadedTexture: Texture) => {
      material.map = loadedTexture;
      material.needsUpdate = true;
      material.map.wrapS = material.map.wrapT = RepeatWrapping;
      material.map.repeat.set(
        length * texture.lengthRepeatScale,
        height * texture.heightRepeatScale
      );
    });

    if (texture.normal) {
      loader.load(texture.normal.uri, (loadedTexture: Texture) => {
        material.normalMap = loadedTexture;
        material.normalScale = new Vector2(
          texture.normal.normalScaleX,
          texture.normal.normalScaleY
        );
        material.normalMap.wrapS = material.normalMap.wrapT = RepeatWrapping;
        material.normalMap.repeat.set(
          length * texture.normal.lengthRepeatScale,
          height * texture.normal.heightRepeatScale
        );
      });
    }
  }
};

/**
 * Function that assigns UV coordinates to a geometry
 */
const assignUVs = (geometry: ShapeGeometry): void => {
  geometry.computeBoundingBox();

  if (!geometry.boundingBox) {
    throw new Error("Bounding box could not be computed");
  }

  const { min, max } = geometry.boundingBox;
  const offset = new Vector2(0 - min.x, 0 - min.y);
  const range = new Vector2(max.x - min.x, max.y - min.y);

  const positions = geometry.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    const uvx = (x + offset.x) / range.x;
    const uvy = (y + offset.y) / range.y;

    uvs[i * 2] = uvx;
    uvs[i * 2 + 1] = uvy;
  }

  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
};

export async function createArea(
  element: Element,
  layer: Layer,
  scene: Scene,
  textures: TextureMap
): Promise<Mesh> {
  const vertices: Vertex[] = element.vertices.map((vertexID) =>
    layer.vertices.get(vertexID)
  );

  const textureName = element.properties.get("texture");
  let color = element.properties.get("patternColor");

  if (element.selected) {
    color = SharedStyle.AREA_MESH_COLOR.selected;
  } else if (textureName && textureName !== "none") {
    color = SharedStyle.AREA_MESH_COLOR.unselected;
  }

  const shape = new Shape();
  shape.moveTo(vertices[0].x, vertices[0].y);
  vertices.slice(1).forEach((vertex) => {
    shape.lineTo(vertex.x, vertex.y);
  });

  const areaMaterial = new MeshPhongMaterial({
    side: DoubleSide,
    color,
  });

  // Create holes for the area
  element.holes.forEach((holeID) => {
    const holeCoords: [number, number][] = [];
    layer.getIn(["areas", holeID, "vertices"]).forEach((vertexID: string) => {
      const { x, y } = layer.getIn(["vertices", vertexID]);
      holeCoords.push([x, y]);
    });
    const holeShape = createShape(holeCoords.reverse());
    shape.holes.push(holeShape);
  });

  const shapeGeometry = new ShapeGeometry(shape);
  assignUVs(shapeGeometry);

  const boundingBox = new Box3().setFromObject(
    new Mesh(shapeGeometry, new MeshBasicMaterial())
  );

  const width = boundingBox.max.x - boundingBox.min.x;
  const height = boundingBox.max.y - boundingBox.min.y;

  const texture = textures[textureName];
  applyTexture(areaMaterial, texture, width, height);

  const area = new Mesh(shapeGeometry, areaMaterial);
  area.rotation.x -= Math.PI / 2;
  area.name = "floor";

  return area;
}

export async function updatedArea(
  element: Element,
  layer: Layer,
  scene: Scene,
  textures: TextureMap,
  mesh: Object3D,
  oldElement: Element,
  differences: string[],
  selfDestroy: () => void,
  selfBuild: () => Promise<Mesh>
): Promise<Object3D> {
  const noPerf = async () => {
    selfDestroy();
    return selfBuild();
  };

  const floor = mesh.getObjectByName("floor") as Mesh;

  if (!floor) {
    return noPerf();
  }

  if (differences[0] === "selected") {
    const color = element.selected
      ? SharedStyle.AREA_MESH_COLOR.selected
      : element.properties.get("patternColor") ||
        SharedStyle.AREA_MESH_COLOR.unselected;

    if (floor.material instanceof MeshPhongMaterial) {
      floor.material.color.set(color);
    }
  } else if (differences[0] === "properties" && differences[1] === "texture") {
    return noPerf();
  } else {
    return noPerf();
  }

  return mesh;
}

/**
 * Creates a shape given a list of coordinates
 */
const createShape = (shapeCoords: [number, number][]): Shape => {
  const shape = new Shape();
  shape.moveTo(shapeCoords[0][0], shapeCoords[0][1]);
  shapeCoords.slice(1).forEach(([x, y]) => {
    shape.lineTo(x, y);
  });
  return shape;
};
