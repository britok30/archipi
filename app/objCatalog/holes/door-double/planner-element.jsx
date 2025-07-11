"use client";

import React from "react";
import * as Three from "three";

const black = new Three.MeshLambertMaterial({ color: 0x000000 });
const metalBlue = new Three.MeshLambertMaterial({ color: 0xb7ceec });
const grey = new Three.MeshLambertMaterial({ color: 0xd2b06a });
const darkGrey = new Three.MeshLambertMaterial({ color: 0xffefce });

const boxMaterials = [grey, grey, grey, grey, darkGrey, darkGrey];

function makeDoor(width, height, thickness) {
  let door_double = new Three.Mesh();

  let LongDoorGeometry = new Three.BoxGeometry(0.75 * width, height, thickness);
  let longDoor = new Three.Mesh(LongDoorGeometry, boxMaterials);
  longDoor.position.x -= width * 0.25;
  door_double.add(longDoor);

  let ShortDoorGeometry = new Three.BoxGeometry(
    0.25 * width,
    height,
    thickness
  );
  let shortDoor = new Three.Mesh(ShortDoorGeometry, boxMaterials);
  shortDoor.position.x += width * 0.25;
  shortDoor.position.z += thickness / 10;
  door_double.add(shortDoor);

  let handle = makeHandle(width);
  handle.position.set(width / 20, height / 40, thickness / 2 + thickness / 10);
  handle.rotation.z += Math.PI;
  handle.rotation.x += Math.PI / 2;
  door_double.add(handle);

  let handleBase = makeHandleBase();
  handleBase.position.set(width / 20, 0, thickness / 2);
  handleBase.rotation.x = 0;
  door_double.add(handleBase);

  let handle2 = makeHandle(width);
  handle2.position.set(
    width / 20,
    height / 40,
    -thickness / 2 - thickness / 10
  );
  handle2.rotation.z += Math.PI;
  handle2.rotation.x -= Math.PI / 2;
  door_double.add(handle2);

  let handleBase2 = makeHandleBase();
  handleBase2.position.set(width / 20, 0, -thickness / 2);
  handleBase2.rotation.x = 0;
  door_double.add(handleBase2);

  return door_double;
}

function makeHandle(width) {
  let handle = new Three.Object3D();
  let geometry_p1 = new Three.CylinderGeometry(
    width / 100,
    width / 100,
    width / 32.5,
    Math.round(32)
  );
  let geometry_p2 = new Three.SphereGeometry(
    width / 100,
    Math.round(32),
    Math.round(32)
  );
  let geometry_p3 = new Three.CylinderGeometry(
    width / 100,
    width / 100,
    width / 14.5,
    Math.round(32)
  );
  let p1 = new Three.Mesh(geometry_p1, black);
  let p2 = new Three.Mesh(geometry_p2, black);
  let p3 = new Three.Mesh(geometry_p3, black);
  let p4 = new Three.Mesh(geometry_p2, black);
  p3.rotation.z = Math.PI / 2;
  p3.position.x = width / 14.5 / 2;
  p2.position.y = -width / 32.5 / 2;
  p4.position.y = -width / 14.5 / 2;
  p3.add(p4);
  p2.add(p3);
  p1.add(p2);
  handle.add(p1);

  return handle;
}

function makeHandleBase() {
  let handleBase = new Three.Object3D();
  let geometryBase1 = new Three.BoxGeometry(7.6, 28, 2);
  let geometryBase2 = new Three.CylinderGeometry(3.6, 3.6, 2, Math.round(32));
  let lock = makeLock();
  let handleBase1 = new Three.Mesh(geometryBase1, black);
  let handleBase2 = new Three.Mesh(geometryBase2, black);
  lock.rotation.x = Math.PI / 2;
  lock.position.y = -3;
  handleBase2.rotation.x = Math.PI / 2;
  handleBase2.position.y = -3.3;
  handleBase2.scale.z = 1.5;
  handleBase1.add(lock);
  handleBase1.add(handleBase2);
  handleBase.add(handleBase1);

  return handleBase;
}

function makeLock() {
  let lock = new Three.Object3D();
  let LockGeometry1 = new Three.CylinderGeometry(1.5, 1.5, 4, Math.round(32));
  let lockGeometry2 = new Three.BoxGeometry(1.6, 4, 4);
  let lockGeometry3 = new Three.BoxGeometry(1.4, 4.06, 0.36);
  let lock_p1 = new Three.Mesh(LockGeometry1, metalBlue);
  let lock_p2 = new Three.Mesh(lockGeometry2, metalBlue);
  let lock_p3 = new Three.Mesh(lockGeometry3, grey);
  lock_p2.position.z = 1;
  lock_p1.add(lock_p2);
  lock_p1.add(lock_p3);
  lock.add(lock_p1);

  return lock;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "double door",
  prototype: "holes",

  info: {
    tag: ["door"],
    title: "double door",
    description: "Double Door",
    image: "/images/door_double.png",
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

  render2D: function (element, layer, scene) {
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

    let hFlip = element.properties.get("flip_horizontal");
    let vFlip = element.properties.get("flip_vertical");
    let length = element.properties.get("width").get("length");
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

  render3D: function (element, layer, scene) {
    let flip = element.properties.get("flip_horizontal");
    let width = element.properties.get("width").get("length");
    let height = element.properties.get("height").get("length");
    let thickness = element.properties.get("thickness").get("length");
    let newAltitude = element.properties.get("altitude").get("length");

    let door_double = new Three.Object3D();
    door_double.add(
      makeDoor(width, height, thickness).clone(width, height, thickness)
    );

    let valuePosition = new Three.Box3().setFromObject(door_double);

    let deltaX = Math.abs(valuePosition.max.x - valuePosition.min.x);
    let deltaY = Math.abs(valuePosition.max.y - valuePosition.min.y);
    let deltaZ = Math.abs(valuePosition.max.z - valuePosition.min.z);

    if (element.selected) {
      let bbox = new Three.BoxHelper(door_double, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      door_double.add(bbox);
    }

    if (flip) {
      door_double.rotation.y += Math.PI;
      door_double.position.x -= width / 4;
    }

    door_double.position.y += newAltitude;
    door_double.position.x += width / 8;
    door_double.scale.set(width / deltaX, height / deltaY, thickness / deltaZ);

    return Promise.resolve(door_double);
  },
};
