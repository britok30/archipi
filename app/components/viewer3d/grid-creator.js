import * as Three from "three";
import { HELVETIKER } from "./libs/helvetiker_regular.typeface.js";
import gridHorizontalStreak from "./grids/grid-horizontal-streak.ts";
import gridVerticalStreak from "./grids/grid-vertical-streak.ts";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export default function createGrid(scene) {
  let gridMesh = new Three.Object3D();
  gridMesh.name = "grid";
  let fontLoader = new FontLoader();
  let font = fontLoader.parse(HELVETIKER); // For measures
  let { grids, width, height } = scene;

  grids.forEach((grid) => {
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
