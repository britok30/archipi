import { ElementsFactories } from "../../catalog";

let info = {
  title: "area",
  tag: ["area"],
  description: "Generic Room",
  image: "",
};

let textures = {
  parquet: {
    name: "Parquet",
    uri: "/images/textures/parquet.jpg",
    lengthRepeatScale: 0.004,
    heightRepeatScale: 0.004,
  },
  tile1: {
    name: "Tile1",
    uri: "/images/textures/tile1.jpg",
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
  },
  ceramic: {
    name: "Ceramic Tile",
    uri: "/images/textures/ceramic-tile.jpg",
    lengthRepeatScale: 0.02,
    heightRepeatScale: 0.02,
  },
  strand_porcelain: {
    name: "Strand Porcelain Tile",
    uri: "/images/textures/strand-porcelain.jpg",
    lengthRepeatScale: 0.02,
    heightRepeatScale: 0.02,
  },
  grass: {
    name: "Grass",
    uri: "/images/textures/grass.jpg",
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01,
  },
};

export default ElementsFactories.AreaFactory("area", info, textures);
