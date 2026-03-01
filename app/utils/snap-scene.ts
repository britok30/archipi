import {
  SNAP_POINT,
  SNAP_LINE,
  SNAP_SEGMENT,
  SNAP_GRID,
  SNAP_GUIDE,
  addPointSnap,
  addLineSnap,
  addLineSegmentSnap,
  addGridSnap,
  SnapElementLike,
} from "./snap";
import { List } from "immutable";
import { horizontalLine, verticalLine } from "./geometry";
import type { Scene, Layer, Vertex, Line as LineType, Guides } from "../store/types";

interface SnapSceneMask {
  [key: string]: boolean;
}

export function sceneSnapElements(
  scene: Scene,
  snapElements: List<SnapElementLike> = List<SnapElementLike>(),
  snapMask: SnapSceneMask = {}
): List<SnapElementLike> {
  let { width, height } = scene;

  let a: number, b: number, c: number;
  return snapElements.withMutations((snapElements) => {
    Object.values(scene.layers).forEach((layer: Layer) => {
      let { lines, vertices } = layer;

      Object.values(vertices).forEach(({ id: vertexID, x, y }: Vertex) => {
        if (snapMask[SNAP_POINT]) {
          addPointSnap(snapElements as unknown as List<SnapElementLike>, x, y, 10, 10, vertexID);
        }

        if (snapMask[SNAP_LINE]) {
          ({ a, b, c } = horizontalLine(y));
          addLineSnap(snapElements as unknown as List<SnapElementLike>, a, b, c, 10, 1, vertexID);
          ({ a, b, c } = verticalLine(x));
          addLineSnap(snapElements as unknown as List<SnapElementLike>, a, b, c, 10, 1, vertexID);
        }
      });

      if (snapMask[SNAP_SEGMENT]) {
        Object.values(lines).forEach(({ id: lineID, vertices: [v0, v1] }: LineType) => {
          try {
            const x1 = vertices[v0]?.x ?? 0;
            const y1 = vertices[v0]?.y ?? 0;
            const x2 = vertices[v1]?.x ?? 0;
            const y2 = vertices[v1]?.y ?? 0;

            addLineSegmentSnap(
              snapElements as unknown as List<SnapElementLike>,
              x1, y1, x2, y2, 20, 1, lineID
            );
          } catch (err) {
            console.warn(`Error processing line ${lineID}:`, err);
          }
        });
      }
    });

    if (snapMask[SNAP_GRID]) {
      let divider = 5;
      let gridCellSize = 100 / divider;
      let xCycle = width / gridCellSize;
      let yCycle = height / gridCellSize;

      for (let x = 0; x < xCycle; x++) {
        let xMul = x * gridCellSize;

        for (let y = 0; y < yCycle; y++) {
          let yMul = y * gridCellSize;

          let onXCross = !(x % divider) ? true : false;
          let onYCross = !(y % divider) ? true : false;

          addGridSnap(
            snapElements as unknown as List<SnapElementLike>,
            xMul,
            yMul,
            10,
            onXCross && onYCross ? 15 : 10,
            null
          );
        }
      }
    }

    if (snapMask[SNAP_GUIDE]) {
      let horizontal = scene.guides?.horizontal || {};
      let vertical = scene.guides?.vertical || {};

      let hValues = Object.values(horizontal);
      let vValues = Object.values(vertical);

      hValues.forEach((hVal) => {
        vValues.forEach((vVal) => {
          addPointSnap(
            snapElements as unknown as List<SnapElementLike>,
            vVal as unknown as number,
            hVal as unknown as number,
            10, 10
          );
        });
      });

      hValues.forEach((hVal) =>
        addLineSegmentSnap(
          snapElements as unknown as List<SnapElementLike>,
          0, hVal as unknown as number,
          width, hVal as unknown as number,
          20, 1
        )
      );
      vValues.forEach((vVal) =>
        addLineSegmentSnap(
          snapElements as unknown as List<SnapElementLike>,
          vVal as unknown as number, 0,
          vVal as unknown as number, height,
          20, 1
        )
      );
    }
  });
}
