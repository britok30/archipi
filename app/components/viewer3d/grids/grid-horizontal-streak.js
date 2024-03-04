import * as Three from "three";
import { List } from "immutable";
import { COLORS } from "../../../styles/shared-style";

// eslint-disable-next-line import/no-anonymous-default-export
export default function (width, height, grid, font) {
  let step = grid.properties.get("step");
  let colors = grid.properties.has("color")
    ? new List([grid.properties.get("color")])
    : grid.properties.get("colors");

  let streak = new Three.Object3D();
  streak.name = "streak";
  let counter = 0;

  for (let i = 0; i <= height; i += step) {
    // Using BufferGeometry instead of Geometry
    let geometry = new Three.BufferGeometry();
    const vertices = new Float32Array([
      0,
      0,
      -i, // vertex 1
      width,
      0,
      -i, // vertex 2
    ]);
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute("position", new Three.BufferAttribute(vertices, 3));
    let color = colors.get(counter % colors.size);
    let material = new Three.LineBasicMaterial({ color });

    if (counter % 5 === 0) {
      let shapes = font.generateShapes("" + counter * step, 16);
      let shapeGeometry = new Three.ShapeGeometry(shapes);
      shapeGeometry.computeBoundingBox();

      let xMid =
        -0.5 *
        (shapeGeometry.boundingBox.max.x - shapeGeometry.boundingBox.min.x);

      shapeGeometry.translate(xMid, 0, 0);

      let wrapper = new Three.MeshBasicMaterial({ color: COLORS.black });
      let words = new Three.Mesh(shapeGeometry, wrapper);

      words.rotation.x -= Math.PI / 2;
      words.position.set(-90, 0, -i);
      streak.add(words);
    }

    streak.add(new Three.LineSegments(geometry, material));
    counter++;
  }
  return streak;
}
