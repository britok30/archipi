// import MTLLoader from "./mtl-loader";
// import OBJLoader from "./obj-loader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export function loadObjWithMaterial(mtlFile: string, objFile: string, imgPath: string = ''): Promise<any> {
  let mtlLoader = new MTLLoader();
  mtlLoader.setResourcePath(imgPath);
  let url = mtlFile;

  return new Promise((resolve, reject) => {
    mtlLoader.load(url, (materials) => {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(objFile, (object) => resolve(object));
    });
  });
}
