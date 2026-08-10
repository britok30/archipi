"use client";

import * as Three from "three";

import React from "react";
import { loadGlb, fitGlbToBox, addSelectionBox } from "../../utils/load-glb";
import { readItemLength } from "../../utils/read-length";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "table-round",
  prototype: "items",

  info: {
    title: "Round Table",
    tag: ["furnishings","kitchen","living"],
    description: "Round dining table",
    image: "/images/table-round.png",
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 110,
        unit: "cm",
      },
    },
    depth: {
      label: "Depth",
      type: "length-measure",
      defaultValue: {
        length: 110,
        unit: "cm",
      },
    },
    height: {
      label: "Height",
      type: "length-measure",
      defaultValue: {
        length: 75,
        unit: "cm",
      },
    },
    altitude: {
      label: "Altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: "cm",
      },
    },
  },

  render2D: function (element: any, layer: any, scene: any) {
    let newWidth = readItemLength(element.properties?.width, scene, 110);

    let angle = element.rotation + 90;
    let textRotation = Math.sin((angle * Math.PI) / 180) < 0 ? 180 : 0;

    let style = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g>
        <circle key="1" cx="0" cy="0" r={newWidth / 2} style={style} />
        <text
          key="2"
          x="0"
          y="0"
          transform={`scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle" as const, fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: async function (element: any, layer: any, scene: any) {
    const newWidth = readItemLength(element.properties?.width, scene, 110);

    const newDepth = readItemLength(element.properties?.depth, scene, 110);

    const newHeight = readItemLength(element.properties?.height, scene, 75);

    const newAltitude = readItemLength(element.properties?.altitude, scene, 0);

    const item = new Three.Object3D();
    const model = await loadGlb("/models/table-round.glb");
    fitGlbToBox(model, { width: newWidth, height: newHeight, depth: newDepth });
    item.add(model);
    item.position.y += newAltitude;
    if (element.selected) addSelectionBox(item);
    return item;
  },

  updateRender3D: (
    element: any,
    layer: any,
    scene: any,
    mesh: any,
    oldElement: any,
    differences: any,
    selfDestroy: any,
    selfBuild: any
  ) => {
    let noPerf = () => {
      selfDestroy();
      return selfBuild();
    };

    if (differences.indexOf("rotation") !== -1) {
      mesh.rotation.y = (element.rotation * Math.PI) / 180;
      return Promise.resolve(mesh);
    }

    return noPerf();
  },
};
