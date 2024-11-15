import {
  SELECT_TOOL_3D_VIEW,
  SELECT_TOOL_3D_FIRST_PERSON,
} from "../utils/constants";

export interface Viewer3DActionsType {
  selectTool3DView: () => SelectTool3DViewAction;
  selectTool3DFirstPerson: () => SelectTool3DFirstPersonAction;
}

// Action Types
export interface SelectTool3DViewAction {
  type: typeof SELECT_TOOL_3D_VIEW;
}

export interface SelectTool3DFirstPersonAction {
  type: typeof SELECT_TOOL_3D_FIRST_PERSON;
}

// Viewer3D Actions Union
export type Viewer3DActions =
  | SelectTool3DViewAction
  | SelectTool3DFirstPersonAction;

// Functions
export function selectTool3DView(): SelectTool3DViewAction {
  return {
    type: SELECT_TOOL_3D_VIEW,
  };
}

export function selectTool3DFirstPerson(): SelectTool3DFirstPersonAction {
  return {
    type: SELECT_TOOL_3D_FIRST_PERSON,
  };
}
