"use client";

import React from "react";
import * as Three from "three";
import { loadGlb, fitGlbToBox, addSelectionBox } from "../../utils/load-glb";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "double door",
  prototype: "holes",

  info: {
    tag: ["door"],
    title: "double door",
    description: "Double Door",
    image: "/images/doorway-double.png",
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 200,
      },
    },
    height: {
      label: "Height",
      type: "length-measure",
      defaultValue: {
        length: 215,
      },
    },
    altitude: {
      label: "Altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
      },
    },
    thickness: {
      label: "Thickness",
      type: "length-measure",
      defaultValue: {
        length: 30,
      },
    },
    flip_horizontal: {
      label: "Horizontal Flip",
      type: "checkbox",
      defaultValue: false,
      values: {
        none: false,
        yes: true,
      },
    },
    flip_vertical: {
      label: "Vertical Flip",
      type: "checkbox",
      defaultValue: false,
      values: {
        none: false,
        yes: true,
      },
    },
  },

  render2D: function (element: any, layer: any, scene: any) {
    const STYLE_HOLE_BASE = {
      stroke: "#000",
      strokeWidth: "3px",
      fill: "#000",
    };
    const STYLE_HOLE_SELECTED = {
      stroke: "#0096fd",
      strokeWidth: "4px",
      fill: "#0096fd",
      cursor: "move",
    };
    const STYLE_ARC_BASE = {
      stroke: "#000",
      strokeWidth: "3px",
      strokeDasharray: "5,5",
      fill: "none",
    };
    const STYLE_ARC_SELECTED = {
      stroke: "#0096fd",
      strokeWidth: "4px",
      strokeDasharray: "5,5",
      fill: "none",
      cursor: "move",
    };
    const EPSILON = 3;

    let hFlip = element.properties?.flip_horizontal;
    let vFlip = element.properties?.flip_vertical;
    let length = element.properties?.width?.length;
    let holePath = `M${0} ${-EPSILON}  L${length} ${-EPSILON}  L${length} ${EPSILON}  L${0} ${EPSILON}  z`;
    let holeStyle = element.selected ? STYLE_HOLE_SELECTED : STYLE_HOLE_BASE;
    let arcPath1 = `M${0},${0}  A${length / 4},${length / 4} 0 0,1 ${
      length / 4
    },${length / 4}`;
    let arcPath2 = `M${0},${0}  A${length / 2 + length / 4},${
      length / 2 + length / 4
    } 0 0,0 ${length / 2 + length / 4},${length / 2 + length / 4}`;
    let arcStyle = element.selected ? STYLE_ARC_SELECTED : STYLE_ARC_BASE;

    // TODO(pg): handle vertical flip and correct horizontal flip
    if (hFlip) {
      return (
        <g transform={`translate(${-length / 2}, 0)`}>
          <path
            d={arcPath1}
            style={arcStyle}
            transform={`translate(${0},${-length / 4})`}
          />
          <line
            x1={0}
            y1={0 - EPSILON}
            x2={0}
            y2={-length / 4 - EPSILON}
            style={holeStyle}
          />
          <path
            d={arcPath2}
            style={arcStyle}
            transform={`translate(${length},${
              -length / 2 - length / 4
            }) rotate(90)`}
          />
          <line
            x1={length}
            y1={0 - EPSILON}
            x2={length}
            y2={-length / 2 - length / 4 - EPSILON}
            style={holeStyle}
          />
          <path d={holePath} style={holeStyle} />
        </g>
      );
    } else {
      return (
        <g transform={`translate(${-length / 2}, 0)`}>
          <path
            d={arcPath1}
            style={arcStyle}
            transform={`translate(${length},${length / 4}) rotate(180)`}
          />
          <line
            x1={0}
            y1={0 - EPSILON}
            x2={0}
            y2={length / 2 + length / 4 - EPSILON}
            style={holeStyle}
          />
          <path
            d={arcPath2}
            style={arcStyle}
            transform={`translate(${0},${length / 2 + length / 4}) rotate(270)`}
          />
          <line
            x1={length}
            y1={0 - EPSILON}
            x2={length}
            y2={length / 4 - EPSILON}
            style={holeStyle}
          />
          <path d={holePath} style={holeStyle} />
        </g>
      );
    }
  },

  render3D: async function (element: any, layer: any, scene: any) {
    const width = element.properties?.width?.length ?? 200;
    const height = element.properties?.height?.length ?? 215;
    const thickness = element.properties?.thickness?.length ?? 30;
    const hFlip = element.properties?.flip_horizontal;

    // Two Kenney doorway leaves (native bbox 0.486 x 1.010 x 0.113 — door
    // span already along X, no rotation wrapper needed), mirrored so the
    // hinges sit on the outer jambs.
    const [leftLeaf, rightLeaf] = await Promise.all([
      loadGlb("/models/doorway.glb"),
      loadGlb("/models/doorway.glb"),
    ]);
    fitGlbToBox(leftLeaf, { width: width / 2, height, depth: thickness });
    fitGlbToBox(rightLeaf, { width: width / 2, height, depth: thickness });
    leftLeaf.position.x -= width / 4;

    // fitGlbToBox centers each leaf on x/z = 0, so mirroring via a wrapper
    // keeps the right leaf centered before it is shifted to its half.
    const rightWrap = new Three.Object3D();
    rightWrap.add(rightLeaf);
    rightWrap.scale.x = -1;
    rightWrap.position.x = width / 4;

    const holder = new Three.Object3D();
    holder.add(leftLeaf, rightWrap);
    if (hFlip) holder.rotation.y = Math.PI;

    if (element.selected) addSelectionBox(holder);
    return holder;
  },
};
