"use client";

import * as Three from "three";

import React from "react";
import { loadGlb, fitGlbToBox, addSelectionBox } from "../../utils/load-glb";
import { readItemLength } from "../../utils/read-length";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "cabinet-television-doors",
  prototype: "items",

  info: {
    title: "TV Cabinet with Doors",
    tag: ["furnishings","living"],
    description: "Television cabinet with doors",
    image: "/images/cabinet-television-doors.png",
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 140,
        unit: "cm",
      },
    },
    depth: {
      label: "Depth",
      type: "length-measure",
      defaultValue: {
        length: 45,
        unit: "cm",
      },
    },
    height: {
      label: "Height",
      type: "length-measure",
      defaultValue: {
        length: 50,
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
    let newWidth = readItemLength(element.properties?.width, scene, 140);

    let newDepth = readItemLength(element.properties?.depth, scene, 45);

    let angle = element.rotation + 90;
    let textRotation = Math.sin((angle * Math.PI) / 180) < 0 ? 180 : 0;

    let style = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    let arrowStyle = {
      stroke: element.selected ? "#0096fd" : undefined,
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        <rect
          key="1"
          x="0"
          y="0"
          width={newWidth}
          height={newDepth}
          style={style}
        />
        <line
          key="2"
          x1={newWidth / 2}
          x2={newWidth / 2}
          y1={newDepth}
          y2={newDepth + 30}
          style={arrowStyle}
        />
        <line
          key="3"
          x1={0.35 * newWidth}
          x2={newWidth / 2}
          y1={newDepth + 15}
          y2={newDepth + 30}
          style={arrowStyle}
        />
        <line
          key="4"
          x1={newWidth / 2}
          x2={0.65 * newWidth}
          y1={newDepth + 30}
          y2={newDepth + 15}
          style={arrowStyle}
        />
        <text
          key="5"
          x="0"
          y="0"
          transform={`translate(${newWidth / 2}, ${
            newDepth / 2
          }) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle" as const, fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: async function (element: any, layer: any, scene: any) {
    const newWidth = readItemLength(element.properties?.width, scene, 140);

    const newDepth = readItemLength(element.properties?.depth, scene, 45);

    const newHeight = readItemLength(element.properties?.height, scene, 50);

    const newAltitude = readItemLength(element.properties?.altitude, scene, 0);

    const item = new Three.Object3D();
    const model = await loadGlb("/models/cabinet-television-doors.glb");
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
