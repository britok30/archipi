"use client";

import * as Three from "three";
import React from "react";
import { loadTexture } from "../../utils/load-texture";

const WIDTH = 80;
const DEPTH = 80;
const HEIGHT = 200;
const woodMaterial = loadTexture("/images/textures/wood.jpg");
const bookTexture1 = loadTexture("/images/textures/bookTexture1.jpg");
const bookTexture2 = loadTexture("/images/textures/bookTexture2.jpg");
const bookTexture3 = loadTexture("/images/textures/bookTexture3.jpg");

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

function makeObjectMaxLOD() {
  let bookcase = new Three.Mesh();

  //Bookcase
  let backGeometry = new Three.BoxGeometry(0.03, 2, 0.8);
  let wood = woodMaterial
    ? new Three.MeshStandardMaterial({ map: woodMaterial })
    : new Three.MeshStandardMaterial({ color: 0x8b6914 });
  let backside = new Three.Mesh(backGeometry, wood);
  backside.position.set(0, 1, 0);
  bookcase.add(backside);

  let sideGeometry = new Three.BoxGeometry(0.3, 2, 0.03);
  let side1 = new Three.Mesh(sideGeometry, wood);
  side1.position.set(0.15, 1, 0.4);
  bookcase.add(side1);

  let side2 = new Three.Mesh(sideGeometry, wood);
  side2.position.set(0.15, 1, -0.4);
  bookcase.add(side2);

  let bottomGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
  let bottomPanel = new Three.Mesh(bottomGeometry, wood);
  bottomPanel.position.set(0.15, 2, 0);
  bookcase.add(bottomPanel);

  let topGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
  let topPanel = new Three.Mesh(topGeometry, wood);
  topPanel.position.set(0.15, 0.015, 0);
  bookcase.add(topPanel);

  //shelves
  for (let i = 1; i < 5; i++) {
    let shelveGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
    let shelve = new Three.Mesh(shelveGeometry, wood);
    shelve.position.set(0.15, 0.015 + i * 0.4, 0);
    bookcase.add(shelve);
  }

  function choiceTexture() {
    return Math.floor(Math.random() * 3);
  }

  //book
  let bookGeometry = new Three.BoxGeometry(0.24, 0.32, 0.76);
  let bookMaterial: any;

  if (bookTexture1 && bookTexture2 && bookTexture3) {
    bookMaterial = [
      new Three.MeshStandardMaterial({ map: bookTexture1 }),
      new Three.MeshStandardMaterial({ map: bookTexture2 }),
      new Three.MeshStandardMaterial({ map: bookTexture3 }),
    ];
  }

  if (bookMaterial) {
    const bookPositions = [0.19, 0.59, 0.99, 1.39, 1.79];
    for (const yPos of bookPositions) {
      let book = new Three.Mesh(bookGeometry, bookMaterial[choiceTexture()]);
      book.position.set(0.15, yPos, 0);
      bookcase.add(book);
    }
  }

  return bookcase;
}

function makeObjectMinLOD() {
  let bookcase = new Three.Mesh();

  //Bookcase
  let backGeometry = new Three.BoxGeometry(0.03, 2, 0.8);
  let wood = woodMaterial
    ? new Three.MeshStandardMaterial({ map: woodMaterial })
    : new Three.MeshStandardMaterial({ color: 0x8b6914 });
  let backside = new Three.Mesh(backGeometry, wood);
  backside.position.set(0, 1, 0);
  bookcase.add(backside);

  let sideGeometry = new Three.BoxGeometry(0.3, 2, 0.03);
  let side1 = new Three.Mesh(sideGeometry, wood);
  side1.position.set(0.15, 1, 0.4);
  bookcase.add(side1);

  let side2 = new Three.Mesh(sideGeometry, wood);
  side2.position.set(0.15, 1, -0.4);
  bookcase.add(side2);

  let bottomGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
  let bottomPanel = new Three.Mesh(bottomGeometry, wood);
  bottomPanel.position.set(0.15, 2, 0);
  bookcase.add(bottomPanel);

  let topGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
  let topPanel = new Three.Mesh(topGeometry, wood);
  topPanel.position.set(0.15, 0.015, 0);
  bookcase.add(topPanel);

  //shelves
  for (let i = 1; i < 5; i++) {
    let shelveGeometry = new Three.BoxGeometry(0.3, 0.03, 0.8);
    let shelve = new Three.Mesh(shelveGeometry, wood);
    shelve.position.set(0.15, 0.015 + i * 0.4, 0);
    bookcase.add(shelve);
  }

  return bookcase;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: "bookcase",
  prototype: "items",

  info: {
    tag: ["furnishings", "wood"],
    title: "bookcase",
    description: "bookcase",
    image: "/images/bookcase.png",
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
  },

  render2D: function (element: any, layer: any, scene: any) {
    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin((angle * Math.PI) / 180) < 0) {
      textRotation = 180;
    }

    let rect_style = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g transform={`translate(${-WIDTH / 2},${-DEPTH / 2})`}>
        <rect
          key="1"
          x="0"
          y="0"
          width={WIDTH}
          height={DEPTH}
          style={rect_style}
        />
        <text
          key="2"
          x="0"
          y="0"
          transform={`translate(${WIDTH / 2}, ${
            DEPTH / 2
          }) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle" as const, fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  render3D: function (element: any, layer: any, scene: any) {
    let newAltitude = element.properties?.altitude?.length;

    /**************** lod max ******************/

    let bookcaseMaxLOD = new Three.Object3D();
    bookcaseMaxLOD.add(objectMaxLOD.clone());

    let value = new Three.Box3().setFromObject(bookcaseMaxLOD);

    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    bookcaseMaxLOD.rotation.y += Math.PI / 2;
    bookcaseMaxLOD.position.y += newAltitude;
    bookcaseMaxLOD.position.z += WIDTH / 2;
    bookcaseMaxLOD.scale.set(WIDTH / deltaX, HEIGHT / deltaY, DEPTH / deltaZ);

    /**************** lod min ******************/

    let bookcaseMinLOD = new Three.Object3D();
    bookcaseMinLOD.add(objectMinLOD.clone());
    bookcaseMinLOD.rotation.y += Math.PI / 2;
    bookcaseMinLOD.position.y += newAltitude;
    bookcaseMinLOD.position.z += WIDTH / 2;
    bookcaseMinLOD.scale.set(WIDTH / deltaX, HEIGHT / deltaY, DEPTH / deltaZ);

    /**** all level of detail ***/

    let lod = new Three.LOD();

    lod.addLevel(bookcaseMaxLOD, 200);
    lod.addLevel(bookcaseMinLOD, 900);
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;

    if (element.selected) {
      let bbox = new Three.BoxHelper(lod, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      lod.add(bbox);
    }

    return Promise.resolve(lod);
  },
};
