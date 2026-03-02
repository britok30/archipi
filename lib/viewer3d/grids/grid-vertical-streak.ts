import * as Three from "three";
import { COLORS } from "@/app/styles/shared-style";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { Grid } from "@/app/store/types";

export default function gridVerticalStreak(
  width: number,
  height: number,
  grid: Grid,
  font: Font
): Three.Object3D {
  let step = grid.properties.step as number;
  let colors: string[] = (grid.properties as any).color
    ? [(grid.properties as any).color]
    : (grid.properties.colors as string[]);

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
    let color = colors[counter % colors.length];
    let material = new Three.LineBasicMaterial({ color });

    if (counter % 5 === 0) {
      // Assuming TextGeometry is available and used as before
      let shape = new TextGeometry("" + counter * step, {
        size: 16,
        depth: 1,
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
