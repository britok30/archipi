import {
  SELECT_HOLE,
  SELECT_TOOL_DRAWING_HOLE,
  UPDATE_DRAWING_HOLE,
  END_DRAWING_HOLE,
  BEGIN_DRAGGING_HOLE,
  UPDATE_DRAGGING_HOLE,
  END_DRAGGING_HOLE,
} from "../utils/constants";

export interface HolesActionsType {
  selectHole: (layerID: string, holeID: string) => SelectHoleAction;
  selectToolDrawingHole: (
    sceneComponentType: string
  ) => SelectToolDrawingHoleAction;
  updateDrawingHole: (
    layerID: string,
    x: number,
    y: number
  ) => UpdateDrawingHoleAction;
  endDrawingHole: (
    layerID: string,
    x: number,
    y: number
  ) => EndDrawingHoleAction;
  beginDraggingHole: (
    layerID: string,
    holeID: string,
    x: number,
    y: number
  ) => BeginDraggingHoleAction;
  updateDraggingHole: (x: number, y: number) => UpdateDraggingHoleAction;
  endDraggingHole: (x: number, y: number) => EndDraggingHoleAction;
}

// Action Types
export interface SelectHoleAction {
  type: typeof SELECT_HOLE;
  layerID: string;
  holeID: string;
}

export interface SelectToolDrawingHoleAction {
  type: typeof SELECT_TOOL_DRAWING_HOLE;
  sceneComponentType: string;
}

export interface UpdateDrawingHoleAction {
  type: typeof UPDATE_DRAWING_HOLE;
  layerID: string;
  x: number;
  y: number;
}

export interface EndDrawingHoleAction {
  type: typeof END_DRAWING_HOLE;
  layerID: string;
  x: number;
  y: number;
}

export interface BeginDraggingHoleAction {
  type: typeof BEGIN_DRAGGING_HOLE;
  layerID: string;
  holeID: string;
  x: number;
  y: number;
}

export interface UpdateDraggingHoleAction {
  type: typeof UPDATE_DRAGGING_HOLE;
  x: number;
  y: number;
}

export interface EndDraggingHoleAction {
  type: typeof END_DRAGGING_HOLE;
  x: number;
  y: number;
}

// Holes Actions Union
export type HolesActions =
  | SelectHoleAction
  | SelectToolDrawingHoleAction
  | UpdateDrawingHoleAction
  | EndDrawingHoleAction
  | BeginDraggingHoleAction
  | UpdateDraggingHoleAction
  | EndDraggingHoleAction;

export function selectHole(layerID: string, holeID: string): SelectHoleAction {
  return {
    type: SELECT_HOLE,
    layerID,
    holeID,
  };
}

export function selectToolDrawingHole(
  sceneComponentType: string
): SelectToolDrawingHoleAction {
  return {
    type: SELECT_TOOL_DRAWING_HOLE,
    sceneComponentType,
  };
}

export function updateDrawingHole(
  layerID: string,
  x: number,
  y: number
): UpdateDrawingHoleAction {
  return {
    type: UPDATE_DRAWING_HOLE,
    layerID,
    x,
    y,
  };
}

export function endDrawingHole(
  layerID: string,
  x: number,
  y: number
): EndDrawingHoleAction {
  return {
    type: END_DRAWING_HOLE,
    layerID,
    x,
    y,
  };
}

export function beginDraggingHole(
  layerID: string,
  holeID: string,
  x: number,
  y: number
): BeginDraggingHoleAction {
  return {
    type: BEGIN_DRAGGING_HOLE,
    layerID,
    holeID,
    x,
    y,
  };
}

export function updateDraggingHole(
  x: number,
  y: number
): UpdateDraggingHoleAction {
  return {
    type: UPDATE_DRAGGING_HOLE,
    x,
    y,
  };
}

export function endDraggingHole(x: number, y: number): EndDraggingHoleAction {
  return {
    type: END_DRAGGING_HOLE,
    x,
    y,
  };
}
