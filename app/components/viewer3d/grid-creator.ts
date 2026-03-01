import * as Three from "three";
import { HELVETIKER } from "./libs/helvetiker_regular.typeface";
import gridHorizontalStreak from "./grids/grid-horizontal-streak";
import gridVerticalStreak from "./grids/grid-vertical-streak";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import type { Scene } from "../../store/types";

export default function createGrid(scene: Scene): Three.Object3D {
  let gridMesh = new Three.Object3D();
  gridMesh.name = "grid";
  let fontLoader = new FontLoader();
  let font = fontLoader.parse(HELVETIKER); // For measures
  let { grids, width, height } = scene;

  Object.values(grids).forEach((grid) => {
    switch (grid.type) {
      case "horizontal-streak":
        gridMesh.add(gridHorizontalStreak(width, height, grid, font));
        break;
      case "vertical-streak":
        gridMesh.add(gridVerticalStreak(width, height, grid, font));
        break;
    }
  });

  gridMesh.position.y = -1;
  return gridMesh;
}
