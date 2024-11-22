"use client";

import { BoxHelper, Box3, ObjectLoader } from "three";
import { loadObjWithMaterial } from "../../utils/load-obj";
import convert, { Unit } from "convert-units";
import React from "react";

const mtl = "/mtl/bed.mtl";
const obj = "/obj/bed.obj";

const width = { length: 160, unit: "cm" };
const depth = { length: 200, unit: "cm" };
const height = { length: 60, unit: "cm" };

let cachedJSONBed = null;

export default {
  name: "bed",
  prototype: "items",

  info: {
    title: "bed",
    tag: ["furnishings", "bedroom"],
    description: "Queen size bed",
    image: "/images/bed.png",
  },

  properties: {
    size: {
      label: "Size",
      type: "string",
      defaultValue: "queen",
      values: ["twin", "full", "queen", "king"],
    },
  },

  render2D: function (element, layer, scene) {
    let angle = element.rotation + 90;
    let textRotation = Math.sin((angle * Math.PI) / 180) < 0 ? 180 : 0;

    let style = {
      stroke: element.selected ? "#0096fd" : "#000",
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
        <rect
          x={width.length * 0.05}
          y={-20}
          width={width.length * 0.9}
          height={20}
          style={style}
        />
        <text
          x="0"
          y="0"
          transform={`translate(${width.length / 2}, ${
            depth.length / 2
          }) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle", fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: async function (element, layer, scene) {
    let onLoadItem = (object) => {
      let newWidth = convert(width.length)
        .from(width.unit as Unit)
        .to(scene.unit);
      let newHeight = convert(height.length)
        .from(height.unit as Unit)
        .to(scene.unit);
      let newDepth = convert(depth.length)
        .from(depth.unit as Unit)
        .to(scene.unit);

      // Apply scale
      object.scale.set(
        newWidth / width.length,
        newDepth / depth.length,
        newHeight / height.length
      );

      // Apply rotation to lay flat
      object.rotation.x = -Math.PI / 2;

      // Get bounding box
      let boundingBox = new Box3().setFromObject(object);

      // Calculate center for X and Z, but use bottom for Y
      let center = {
        x: (boundingBox.max.x + boundingBox.min.x) / 2,
        z: (boundingBox.max.z + boundingBox.min.z) / 2,
      };

      // Position adjustment
      object.position.set(-center.x, -boundingBox.min.y, -center.z);

      return object;
    };

    if (cachedJSONBed) {
      let loader = new ObjectLoader();
      let object = loader.parse(cachedJSONBed);
      return await Promise.resolve(onLoadItem(object));
    }

    return loadObjWithMaterial(mtl, obj).then((object) => {
      cachedJSONBed = object.toJSON();
      let loader = new ObjectLoader();
      return onLoadItem(loader.parse(cachedJSONBed));
    });
  },

  updateRender3D: (
    element,
    layer,
    scene,
    mesh,
    oldElement,
    differences,
    selfDestroy,
    selfBuild
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
