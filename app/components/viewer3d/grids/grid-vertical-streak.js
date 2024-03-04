import * as Three from "three";
import { List } from "immutable";
import { COLORS } from "../../../styles/shared-style";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// eslint-disable-next-line import/no-anonymous-default-export
export default function (width, height, grid, font) {
  let step = grid.properties.get("step");
  let colors = grid.properties.has("color")
    ? new List([grid.properties.get("color")])
    : grid.properties.get("colors");

  let streak = new Three.Object3D();
  streak.name = "streak";

  let counter = 0;

  for (let i = 0; i <= width; i += step) {
    // Using BufferGeometry instead of Geometry
    let geometry = new Three.BufferGeometry();
    const vertices = new Float32Array([
      i,
      0,
      0, // vertex 1
      i,
      0,
      -height, // vertex 2
    ]);
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute("position", new Three.BufferAttribute(vertices, 3));
    let color = colors.get(counter % colors.size);
    let material = new Three.LineBasicMaterial({ color });

    if (counter % 5 === 0) {
      // Assuming TextGeometry is available and used as before
      let shape = new TextGeometry("" + counter * step, {
        size: 16,
        height: 1,
        font: font,
      });

      let wrapper = new Three.MeshBasicMaterial({ color: COLORS.black });
      let words = new Three.Mesh(shape, wrapper);

      words.rotation.x -= Math.PI / 2;
      words.position.set(i - 20, 0, 50);
      streak.add(words);
    }

    streak.add(new Three.LineSegments(geometry, material));
    counter++;
  }
  return streak;
}
