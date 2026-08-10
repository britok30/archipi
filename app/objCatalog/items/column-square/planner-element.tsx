"use client";

import * as Three from "three";
import React from "react";
import { readItemLength } from "../../utils/read-length";

const material = new Three.MeshLambertMaterial({ color: 0xf5f4f4 });

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "column-square",
  prototype: "items",

  info: {
    tag: ["structure"],
    title: "square column",
    description: "Square structural column",
    image: "/images/column-square.png",
  },

  properties: {
    altitude: {
      label: "altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: "cm",
      },
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 300,
        unit: "cm",
      },
    },
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 50,
        unit: "cm",
      },
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 50,
        unit: "cm",
      },
    },
  },

  render2D: function (element: any, layer: any, scene: any) {
    let width = readItemLength(element.properties?.width, scene, 50);
    let depth = readItemLength(element.properties?.depth, scene, 50);

    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin((angle * Math.PI) / 180) < 0) {
      textRotation = 180;
    }

    let rectStyle = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g transform={`translate(${-width / 2},${-depth / 2})`}>
        <rect key="1" x="0" y="0" width={width} height={depth} style={rectStyle} />
        <text
          key="2"
          x="0"
          y="0"
          transform={`translate(${width / 2}, ${depth / 2}) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle" as const, fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: function (element: any, layer: any, scene: any) {
    let HEIGHT = readItemLength(element.properties?.height, scene, 300);
    let width = readItemLength(element.properties?.width, scene, 50);
    let depth = readItemLength(element.properties?.depth, scene, 50);
    let newAltitude = readItemLength(element.properties?.altitude, scene, 0);

    let column = new Three.Object3D();

    let object = new Three.Mesh(new Three.BoxGeometry(width, HEIGHT, depth), material);

    column.add(object);

    if (element.selected) {
      let bbox = new Three.BoxHelper(column, 0x99c3fb);
      bbox.material.linewidth = 10;
      bbox.renderOrder = 5000;
      bbox.material.depthTest = false;
      column.add(bbox);
    }

    column.position.y += HEIGHT / 2 + newAltitude;

    return Promise.resolve(column);
  },
};
