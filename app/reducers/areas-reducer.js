import { Area } from "../class";
import { SELECT_AREA } from "../utils/constants";

export default function ReactPlannerAreasReducer(state, action) {
  switch (action.type) {
    case SELECT_AREA:
      return Area.select(state, action.layerID, action.areaID).updatedState;
    default:
      return state;
  }
}
