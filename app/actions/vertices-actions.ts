import {
  BEGIN_DRAGGING_VERTEX,
  UPDATE_DRAGGING_VERTEX,
  END_DRAGGING_VERTEX,
} from "../utils/constants";

export interface VertexActionsType {
  beginDraggingVertex: (
    layerID: string,
    vertexID: string,
    x: number,
    y: number,
    snapMask: string
  ) => BeginDraggingVertexAction;
  updateDraggingVertex: (
    x: number,
    y: number,
    snapMask: string
  ) => UpdateDraggingVertexAction;
  endDraggingVertex: (
    x: number,
    y: number,
    snapMask: string
  ) => EndDraggingVertexAction;
}

// Action Types
export interface BeginDraggingVertexAction {
  type: typeof BEGIN_DRAGGING_VERTEX;
  layerID: string;
  vertexID: string;
  x: number;
  y: number;
  snapMask: string;
}

export interface UpdateDraggingVertexAction {
  type: typeof UPDATE_DRAGGING_VERTEX;
  x: number;
  y: number;
  snapMask: string;
}

export interface EndDraggingVertexAction {
  type: typeof END_DRAGGING_VERTEX;
  x: number;
  y: number;
  snapMask: string;
}

// Vertex Actions Union
export type VertexActions =
  | BeginDraggingVertexAction
  | UpdateDraggingVertexAction
  | EndDraggingVertexAction;

// Functions
export function beginDraggingVertex(
  layerID: string,
  vertexID: string,
  x: number,
  y: number,
  snapMask: string
): BeginDraggingVertexAction {
  return {
    type: BEGIN_DRAGGING_VERTEX,
    layerID,
    vertexID,
    x,
    y,
    snapMask,
  };
}

export function updateDraggingVertex(
  x: number,
  y: number,
  snapMask: string
): UpdateDraggingVertexAction {
  return {
    type: UPDATE_DRAGGING_VERTEX,
    x,
    y,
    snapMask,
  };
}

export function endDraggingVertex(
  x: number,
  y: number,
  snapMask: string
): EndDraggingVertexAction {
  return {
    type: END_DRAGGING_VERTEX,
    x,
    y,
    snapMask,
  };
}
