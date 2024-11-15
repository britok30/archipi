import { SELECT_AREA } from "../utils/constants";

export interface AreaActionsType {
  selectArea: (layerID: string, areaID: string) => SelectAreaAction;
}

export interface SelectAreaAction {
  type: typeof SELECT_AREA;
  layerID: string;
  areaID: string;
}

export function selectArea(layerID: string, areaID: string): SelectAreaAction {
  return {
    type: SELECT_AREA,
    layerID,
    areaID,
  };
}
