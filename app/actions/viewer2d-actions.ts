import {
  UPDATE_2D_CAMERA,
  SELECT_TOOL_PAN,
  SELECT_TOOL_ZOOM_IN,
  SELECT_TOOL_ZOOM_OUT,
  FIT_SELECTION,
} from "../utils/constants";

export interface Viewer2DActionsType {
  updateCameraView: (value: any) => UpdateCameraViewAction; // Replace `any` with the appropriate type
  selectToolPan: () => SelectToolPanAction;
  selectToolZoomOut: () => SelectToolZoomOutAction;
  selectToolZoomIn: () => SelectToolZoomInAction;
  fitSelection: (value: any) => FitSelectionAction; // Replace `any` with the appropriate type
}

// Action Types
export interface UpdateCameraViewAction {
  type: typeof UPDATE_2D_CAMERA;
  value: any; // Replace `any` with the appropriate type for `value`
}

export interface SelectToolPanAction {
  type: typeof SELECT_TOOL_PAN;
}

export interface SelectToolZoomOutAction {
  type: typeof SELECT_TOOL_ZOOM_OUT;
}

export interface SelectToolZoomInAction {
  type: typeof SELECT_TOOL_ZOOM_IN;
}

export interface FitSelectionAction {
  type: typeof FIT_SELECTION;
  value: any; // Replace `any` with the appropriate type for `value`
}

// Viewer2D Actions Union
export type Viewer2DActions =
  | UpdateCameraViewAction
  | SelectToolPanAction
  | SelectToolZoomOutAction
  | SelectToolZoomInAction
  | FitSelectionAction;

// Functions
export function updateCameraView(value: any): UpdateCameraViewAction {
  return {
    type: UPDATE_2D_CAMERA,
    value,
  };
}

export function selectToolPan(): SelectToolPanAction {
  return {
    type: SELECT_TOOL_PAN,
  };
}

export function selectToolZoomOut(): SelectToolZoomOutAction {
  return {
    type: SELECT_TOOL_ZOOM_OUT,
  };
}

export function selectToolZoomIn(): SelectToolZoomInAction {
  return {
    type: SELECT_TOOL_ZOOM_IN,
  };
}

export function fitSelection(value: any): FitSelectionAction {
  return {
    type: FIT_SELECTION,
    value,
  };
}
