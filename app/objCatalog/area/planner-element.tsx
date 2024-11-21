"use client";

import AreaFactory from "@/app/catalog/factories/AreaFactory";

interface AreaInfo {
  title: string;
  tag: string[];
  description: string;
  image: string;
}

interface TextureDefinition {
  name: string;
  uri: string;
  lengthRepeatScale: number;
  heightRepeatScale: number;
}

const info: AreaInfo = {
  title: "area",
  tag: ["area"],
  description: "Generic Room",
  image: "",
};

const textures: Record<string, TextureDefinition> = {
  parquet: {
    name: "Parquet",
    uri: "/images/textures/parquet.jpg",
    lengthRepeatScale: 0.25,
    heightRepeatScale: 0.25,
  },
  tile1: {
    name: "Tile1",
    uri: "/images/textures/tile1.jpg",
    lengthRepeatScale: 0.5,
    heightRepeatScale: 0.5,
  },
  ceramic: {
    name: "Ceramic Tile",
    uri: "/images/textures/ceramic-tile.jpg",
    lengthRepeatScale: 0.4,
    heightRepeatScale: 0.4,
  },
  strand_porcelain: {
    name: "Strand Porcelain Tile",
    uri: "/images/textures/strand-porcelain.jpg",
    lengthRepeatScale: 0.4,
    heightRepeatScale: 0.4,
  },
  grass: {
    name: "Grass",
    uri: "/images/textures/grass.jpg",
    lengthRepeatScale: 0.3,
    heightRepeatScale: 0.3,
  },
};

export default AreaFactory("area", info, textures);
