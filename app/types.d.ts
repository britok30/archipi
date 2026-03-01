declare module "area-polygon" {
  function areapolygon(polygon: number[][], signed?: boolean): number;
  export default areapolygon;
}

declare module "shortid" {
  function generate(): string;
  export default { generate };
}
