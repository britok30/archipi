import {
  PROJECT_ACTIONS,
  VIEWER2D_ACTIONS,
  VIEWER3D_ACTIONS,
  GROUP_ACTIONS,
  ITEMS_ACTIONS,
  HOLE_ACTIONS,
  LINE_ACTIONS,
  AREA_ACTIONS,
  SCENE_ACTIONS,
  VERTEX_ACTIONS,
} from "../utils/constants";

import ReactPlannerViewer2dReducer from "./viewer2d-reducer";
import ReactPlannerViewer3dReducer from "./viewer3d-reducer";
import ReactPlannerVerticesReducer from "./vertices-reducer";
import ReactPlannerSceneReducer from "./scene-reducer";
import ReactPlannerProjectReducer from "./project-reducer";
import ReactPlannerGroupsReducer from "./groups-reducer";
import ReactPlannerLinesReducer from "./lines-reducer";
import ReactPlannerItemsReducer from "./items-reducer";
import ReactPlannerHolesReducer from "./holes-reducer";
import ReactPlannerAreasReducer from "./areas-reducer";
import { State } from "../models/models";

export const initialState = new State();

export default function appReducer(state, action) {
  if (PROJECT_ACTIONS[action.type])
    return ReactPlannerProjectReducer(...arguments);
  if (VIEWER2D_ACTIONS[action.type])
    return ReactPlannerViewer2dReducer(...arguments);
  if (VIEWER3D_ACTIONS[action.type])
    return ReactPlannerViewer3dReducer(...arguments);
  if (ITEMS_ACTIONS[action.type]) return ReactPlannerItemsReducer(...arguments);
  if (HOLE_ACTIONS[action.type]) return ReactPlannerHolesReducer(...arguments);
  if (LINE_ACTIONS[action.type]) return ReactPlannerLinesReducer(...arguments);
  if (AREA_ACTIONS[action.type]) return ReactPlannerAreasReducer(...arguments);
  if (GROUP_ACTIONS[action.type])
    return ReactPlannerGroupsReducer(...arguments);
  if (SCENE_ACTIONS[action.type]) return ReactPlannerSceneReducer(...arguments);
  if (VERTEX_ACTIONS[action.type])
    return ReactPlannerVerticesReducer(...arguments);

  return state || initialState;
}
