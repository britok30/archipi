import {
  SELECT_LINE,
  SELECT_TOOL_DRAWING_LINE,
  BEGIN_DRAWING_LINE,
  UPDATE_DRAWING_LINE,
  END_DRAWING_LINE,
  BEGIN_DRAGGING_LINE,
  UPDATE_DRAGGING_LINE,
  END_DRAGGING_LINE,
} from "../utils/constants";

export interface LinesActionsType {
  selectLine: (layerID: string, lineID: string) => SelectLineAction;
  selectToolDrawingLine: (
    sceneComponentType: string
  ) => SelectToolDrawingLineAction;
  beginDrawingLine: (
    layerID: string,
    x: number,
    y: number,
    snapMask: string
  ) => BeginDrawingLineAction;
  updateDrawingLine: (
    x: number,
    y: number,
    snapMask: string
  ) => UpdateDrawingLineAction;
  endDrawingLine: (
    x: number,
    y: number,
    snapMask: string
  ) => EndDrawingLineAction;
  beginDraggingLine: (
    layerID: string,
    lineID: string,
    x: number,
    y: number,
    snapMask: string
  ) => BeginDraggingLineAction;
  updateDraggingLine: (
    x: number,
    y: number,
    snapMask: string
  ) => UpdateDraggingLineAction;
  endDraggingLine: (
    x: number,
    y: number,
    snapMask: string
  ) => EndDraggingLineAction;
}

// Action Types
export interface SelectLineAction {
  type: typeof SELECT_LINE;
  layerID: string;
  lineID: string;
}

export interface SelectToolDrawingLineAction {
  type: typeof SELECT_TOOL_DRAWING_LINE;
  sceneComponentType: string;
}

export interface BeginDrawingLineAction {
  type: typeof BEGIN_DRAWING_LINE;
  layerID: string;
  x: number;
  y: number;
  snapMask: string;
}

export interface UpdateDrawingLineAction {
  type: typeof UPDATE_DRAWING_LINE;
  x: number;
  y: number;
  snapMask: string;
}

export interface EndDrawingLineAction {
  type: typeof END_DRAWING_LINE;
  x: number;
  y: number;
  snapMask: string;
}

export interface BeginDraggingLineAction {
  type: typeof BEGIN_DRAGGING_LINE;
  layerID: string;
  lineID: string;
  x: number;
  y: number;
  snapMask: string;
}

export interface UpdateDraggingLineAction {
  type: typeof UPDATE_DRAGGING_LINE;
  x: number;
  y: number;
  snapMask: string;
}

export interface EndDraggingLineAction {
  type: typeof END_DRAGGING_LINE;
  x: number;
  y: number;
  snapMask: string;
}

// Lines Actions Union
export type LinesActions =
  | SelectLineAction
  | SelectToolDrawingLineAction
  | BeginDrawingLineAction
  | UpdateDrawingLineAction
  | EndDrawingLineAction
  | BeginDraggingLineAction
  | UpdateDraggingLineAction
  | EndDraggingLineAction;

// Functions
export function selectLine(layerID: string, lineID: string): SelectLineAction {
  return {
    type: SELECT_LINE,
    layerID,
    lineID,
  };
}

export function selectToolDrawingLine(
  sceneComponentType: string
): SelectToolDrawingLineAction {
  return {
    type: SELECT_TOOL_DRAWING_LINE,
    sceneComponentType,
  };
}

export function beginDrawingLine(
  layerID: string,
  x: number,
  y: number,
  snapMask: string
): BeginDrawingLineAction {
  return {
    type: BEGIN_DRAWING_LINE,
    layerID,
    x,
    y,
    snapMask,
  };
}

export function updateDrawingLine(
  x: number,
  y: number,
  snapMask: string
): UpdateDrawingLineAction {
  return {
    type: UPDATE_DRAWING_LINE,
    x,
    y,
    snapMask,
  };
}

export function endDrawingLine(
  x: number,
  y: number,
  snapMask: string
): EndDrawingLineAction {
  return {
    type: END_DRAWING_LINE,
    x,
    y,
    snapMask,
  };
}

export function beginDraggingLine(
  layerID: string,
  lineID: string,
  x: number,
  y: number,
  snapMask: string
): BeginDraggingLineAction {
  return {
    type: BEGIN_DRAGGING_LINE,
    layerID,
    lineID,
    x,
    y,
    snapMask,
  };
}

export function updateDraggingLine(
  x: number,
  y: number,
  snapMask: string
): UpdateDraggingLineAction {
  return {
    type: UPDATE_DRAGGING_LINE,
    x,
    y,
    snapMask,
  };
}

export function endDraggingLine(
  x: number,
  y: number,
  snapMask: string
): EndDraggingLineAction {
  return {
    type: END_DRAGGING_LINE,
    x,
    y,
    snapMask,
  };
}
