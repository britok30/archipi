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
} from "./snap";
import { Map, List } from "immutable";
import { horizontalLine, verticalLine } from "./geometry";

export function sceneSnapElements(
  scene,
  snapElements = new List(),
  snapMask = new Map()
) {
  let { width, height } = scene;

  let a, b, c;
  return snapElements.withMutations((snapElements) => {
    scene.layers.forEach((layer) => {
      let { lines, vertices } = layer;

      vertices.forEach(({ id: vertexID, x, y }) => {
        if (snapMask.get(SNAP_POINT)) {
          addPointSnap(snapElements, x, y, 10, 10, vertexID);
        }

        if (snapMask.get(SNAP_LINE)) {
          ({ a, b, c } = horizontalLine(y));
          addLineSnap(snapElements, a, b, c, 10, 1, vertexID);
          ({ a, b, c } = verticalLine(x));
          addLineSnap(snapElements, a, b, c, 10, 1, vertexID);
        }
      });

      if (snapMask.get(SNAP_SEGMENT)) {
        lines.forEach(({ id: lineID, vertices: [v0, v1] }) => {
          try {
            const x1 = vertices?.get(v0)?.x ?? 0;
            const y1 = vertices?.get(v0)?.y ?? 0;
            const x2 = vertices?.get(v1)?.x ?? 0;
            const y2 = vertices?.get(v1)?.y ?? 0;

            addLineSegmentSnap(snapElements, x1, y1, x2, y2, 20, 1, lineID);
          } catch (err) {
            console.warn(`Error processing line ${lineID}:`, err);
          }
        });
      }
    });

    if (snapMask.get(SNAP_GRID)) {
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
            snapElements,
            xMul,
            yMul,
            10,
            onXCross && onYCross ? 15 : 10,
            null
          );
        }
      }
    }

    if (snapMask.get(SNAP_GUIDE)) {
      let horizontal = scene.getIn(["guides", "horizontal"]);
      let vertical = scene.getIn(["guides", "vertical"]);

      let hValues = horizontal.valueSeq();
      let vValues = vertical.valueSeq();

      hValues.forEach((hVal) => {
        vValues.forEach((vVal) => {
          addPointSnap(snapElements, vVal, hVal, 10, 10);
        });
      });

      hValues.forEach((hVal) =>
        addLineSegmentSnap(snapElements, 0, hVal, width, hVal, 20, 1)
      );
      vValues.forEach((vVal) =>
        addLineSegmentSnap(snapElements, vVal, 0, vVal, height, 20, 1)
      );
    }
  });
}
