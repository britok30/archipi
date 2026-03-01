"use client";

import { BoxHelper, Box3, ObjectLoader } from "three";
import { loadObjWithMaterial } from "../../utils/load-obj";
import path from "path";
import convert, { Unit } from "convert-units";

import React from "react";

const mtl = "/mtl/sofa.mtl";
const obj = "/obj/sofa.obj";
const img = "/images/textures/sofa-texture.jpg";

const width = { length: 180, unit: "cm" };
const depth = { length: 60, unit: "cm" };
const height = { length: 70, unit: "cm" };

let cachedJSONSofa: any = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "sofa",
  prototype: "items",

  info: {
    title: "sofa",
    tag: ["furnishings", "leather"],
    description: "Leather sofa",
    image: "/images/sofa.png",
  },

  properties: {},

  render2D: function (element: any, layer: any, scene: any) {
    let angle = element.rotation + 90;
    let textRotation = Math.sin((angle * Math.PI) / 180) < 0 ? 180 : 0;

    let style = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };
    let arrow_style = {
      stroke: element.selected ? "#0096fd" : undefined,
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g transform={`translate(${-width.length / 2},${-depth.length / 2})`}>
        <rect
          x="0"
          y="0"
          width={width.length}
          height={depth.length}
          style={style}
        />
        <line
          x1={width.length / 2}
          x2={width.length / 2}
          y1={depth.length}
          y2={1.5 * depth.length}
          style={arrow_style}
        />
        <line
          x1={0.35 * width.length}
          x2={width.length / 2}
          y1={1.2 * depth.length}
          y2={1.5 * depth.length}
          style={arrow_style}
        />
        <line
          x1={width.length / 2}
          x2={0.65 * width.length}
          y1={1.5 * depth.length}
          y2={1.2 * depth.length}
          style={arrow_style}
        />
        <text
          x="0"
          y="0"
          transform={`translate(${width.length / 2}, ${
            depth.length / 2
          }) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle" as const, fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: async function (element: any, layer: any, scene: any) {
    let onLoadItem = (object: any) => {
      let newWidth = convert(width.length).from(width.unit as Unit).to(scene.unit as Unit);
      let newHeight = convert(height.length).from(height.unit as Unit).to(scene.unit as Unit);
      let newDepth = convert(depth.length).from(depth.unit as Unit).to(scene.unit as Unit);

      object.scale.set(
        newWidth / width.length,
        newHeight / height.length,
        newDepth / depth.length
      );

      let box = new BoxHelper(object, 0x99c3fb);
      box.material.linewidth = 2;
      box.material.depthTest = false;
      box.renderOrder = 1000;
      box.visible = element.selected;
      object.add(box);

      // Normalize the origin of this item
      let boundingBox = new Box3().setFromObject(object);

      let center = [
        (boundingBox.max.x - boundingBox.min.x) / 2 + boundingBox.min.x,
        (boundingBox.max.y - boundingBox.min.y) / 2 + boundingBox.min.y,
        (boundingBox.max.z - boundingBox.min.z) / 2 + boundingBox.min.z,
      ];

      object.position.x -= center[0];
      object.position.y -=
        center[1] - (boundingBox.max.y - boundingBox.min.y) / 2;
      object.position.z -= center[2];

      return object;
    };

    if (cachedJSONSofa) {
      let loader = new ObjectLoader();
      let object = loader.parse(cachedJSONSofa);
      return await Promise.resolve(onLoadItem(object));
    }

    return loadObjWithMaterial(mtl, obj, img).then((object: any) => {
      cachedJSONSofa = object.toJSON();
      let loader = new ObjectLoader();
      return onLoadItem(loader.parse(cachedJSONSofa));
    });
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

    if (differences.indexOf("selected") !== -1) {
      mesh.traverse((child: any) => {
        if (child instanceof BoxHelper) {
          child.visible = element.selected;
        }
      });

      return Promise.resolve(mesh);
    }

    if (differences.indexOf("rotation") !== -1) {
      mesh.rotation.y = (element.rotation * Math.PI) / 180;
      return Promise.resolve(mesh);
    }

    return noPerf();
  },
};
