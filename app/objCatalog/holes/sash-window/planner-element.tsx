"use client";

import React from "react";
import * as Three from "three";
import { loadObjWithMaterial } from "../../utils/load-obj";
import path from "path";

let cached3DWindow: any = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "sash window",
  prototype: "holes",

  info: {
    title: "sash window",
    tag: ["window"],
    description: "Sash window",
    image: "/images/window.png",
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 90,
      },
    },
    height: {
      label: "Height",
      type: "length-measure",
      defaultValue: {
        length: 100,
      },
    },
    altitude: {
      label: "Altitude",
      type: "length-measure",
      defaultValue: {
        length: 90,
      },
    },
    thickness: {
      label: "Thickness",
      type: "length-measure",
      defaultValue: {
        length: 10,
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
      strokeWidth: "3px",
      fill: "#0096fd",
      cursor: "move",
    };
    //let line = layer.lines.get(hole.line);
    //let epsilon = line.properties?.thickness / 2;

    let epsilon = 3;

    let holeWidth = element.properties?.width?.length;
    let holePath = `M${0} ${-epsilon}  L${holeWidth} ${-epsilon}  L${holeWidth} ${epsilon}  L${0} ${epsilon}  z`;
    let holeStyle = element.selected ? STYLE_HOLE_SELECTED : STYLE_HOLE_BASE;
    let length = element.properties?.width?.length;
    return (
      <g transform={`translate(${-length / 2}, 0)`}>
        <path key="1" d={holePath} style={holeStyle} />
        <line
          key="2"
          x1={holeWidth / 2}
          y1={-10 - epsilon}
          x2={holeWidth / 2}
          y2={10 + epsilon}
          style={holeStyle}
        />
      </g>
    );
  },

  render3D: function (element: any, layer: any, scene: any) {
    let onLoadItem = (object: any) => {
      let boundingBox = new Three.Box3().setFromObject(object);

      let initialWidth = boundingBox.max.x - boundingBox.min.x;
      let initialHeight = boundingBox.max.y - boundingBox.min.y;
      let initialThickness = boundingBox.max.z - boundingBox.min.z;

      if (element.selected) {
        let box = new Three.BoxHelper(object, 0x99c3fb);
        box.material.linewidth = 2;
        box.material.depthTest = false;
        box.renderOrder = 1000;
        object.add(box);
      }

      let width = element.properties?.width?.length;
      let height = element.properties?.height?.length;
      let thickness = element.properties?.thickness?.length;

      object.scale.set(
        width / initialWidth,
        height / initialHeight,
        thickness / initialThickness
      );

      return object;
    };

    if (cached3DWindow) {
      return Promise.resolve(onLoadItem(cached3DWindow.clone()));
    }

    let mtl = "/mtl/sash-window.mtl";
    let obj = "/obj/sash-window.obj";
    let img = "/images/texture/texture.png";

    return loadObjWithMaterial(mtl, obj, img).then((object: any) => {
      cached3DWindow = object;
      return onLoadItem(cached3DWindow.clone());
    });
  },
};
