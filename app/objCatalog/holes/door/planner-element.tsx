"use client";

import React from "react";
import * as Three from "three";
import { loadGlb, fitGlbToBox, addSelectionBox } from "../../utils/load-glb";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "door",
  prototype: "holes",

  info: {
    title: "door",
    tag: ["door"],
    description: "Door",
    image: "/images/doorway.png",
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 100,
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
    let arcPath = `M${0},${0}  A${length},${length} 0 0,1 ${length},${length}`;
    let arcStyle = element.selected ? STYLE_ARC_SELECTED : STYLE_ARC_BASE;

    let scaleX: any, scaleY: any;
    let rotateAngle: any;
    let tX: any, tY: any;
    let pX1: any, pX2: any, pY1: any, pY2: any;

    if (hFlip) {
      scaleX = 1;
      if (vFlip) {
        tX = length;
        tY = -length;
        pX1 = -length;
        pY1 = 0;
        pX2 = -length;
        pY2 = length;
        rotateAngle = 180;
        scaleY = -1;
      } else {
        tX = 0;
        tY = -length;
        pX1 = 0;
        pY1 = 0;
        pX2 = 0;
        pY2 = -length;
        scaleY = 1;
        rotateAngle = 0;
      }
    } else {
      scaleX = -1;
      if (vFlip) {
        tX = 0;
        tY = 0;
        pX1 = length;
        pY1 = 0;
        pX2 = length;
        pY2 = length;
        rotateAngle = 90;
        scaleY = 1;
      } else {
        tX = length;
        tY = 0;
        pX1 = 0;
        pY1 = 0;
        pX2 = 0;
        pY2 = -length;
        rotateAngle = -90;
        scaleY = -1;
      }
    }

    return (
      <g transform={`translate(${-length / 2}, 0)`}>
        <path
          d={arcPath}
          style={arcStyle}
          transform={`translate(${tX},${tY}) scale(${scaleX},${scaleY}) rotate(${rotateAngle})`}
        />
        <line
          x1={pX1}
          y1={pY1 - EPSILON}
          x2={pX2}
          y2={pY2 - EPSILON}
          style={holeStyle}
          transform={`scale(${-scaleX},${scaleY})`}
        />
        <path d={holePath} style={holeStyle} />
      </g>
    );
  },

  render3D: async function (element: any, layer: any, scene: any) {
    const width = element.properties?.width?.length ?? 100;
    const height = element.properties?.height?.length ?? 215;
    const thickness = element.properties?.thickness?.length ?? 30;
    const hFlip = element.properties?.flip_horizontal;
    const vFlip = element.properties?.flip_vertical;

    // Kenney doorway.glb native bbox: 0.486 (X, door span) x 1.010 (Y, height)
    // x 0.113 (Z, frame depth) — already oriented door-plane-across-width, so
    // no rotation wrapper is needed; fit it straight into the wall cutout.
    const model = await loadGlb("/models/doorway.glb");
    fitGlbToBox(model, { width, height, depth: thickness });

    // Mirror the hinge side for a vertical flip; fitGlbToBox centers the
    // model on x/z = 0, so a wrapper mirror keeps it centered in the hole.
    const holder = new Three.Object3D();
    holder.add(model);
    if (vFlip) holder.scale.x = -1;
    if (hFlip) holder.rotation.y = Math.PI;

    if (element.selected) addSelectionBox(holder);
    return holder;
  },
};
