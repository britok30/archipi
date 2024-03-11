"use client";

import WallFactory from "../../../catalog/factories/wall-factory";

const info = {
  title: "wall",
  tag: ["wall"],
  description: "Wall with bricks or painted",
  image: "/images/wall.png",
  visibility: {
    catalog: true,
    layerElementsVisible: true,
  },
};

const textures = {
  bricks: {
    name: "Bricks",
    uri: "/images/textures/bricks.jpg",
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
    normal: {
      uri: "/images/textures/bricks-normal.jpg",
      lengthRepeatScale: 0.01,
      heightRepeatScale: 0.01,
      normalScaleX: 0.8,
      normalScaleY: 0.8,
    },
  },
  painted: {
    name: "Painted",
    uri: "/images/textures/painted.jpg",
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
    normal: {
      uri: "/images/textures/painted-normal.jpg",
      lengthRepeatScale: 0.01,
      heightRepeatScale: 0.01,
      normalScaleX: 0.4,
      normalScaleY: 0.4,
    },
  },
};

export default WallFactory("wall", info, textures);
