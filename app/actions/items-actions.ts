import {
  SELECT_ITEM,
  SELECT_TOOL_DRAWING_ITEM,
  UPDATE_DRAWING_ITEM,
  END_DRAWING_ITEM,
  BEGIN_DRAGGING_ITEM,
  UPDATE_DRAGGING_ITEM,
  END_DRAGGING_ITEM,
  BEGIN_ROTATING_ITEM,
  UPDATE_ROTATING_ITEM,
  END_ROTATING_ITEM,
} from "../utils/constants";

export interface ItemsActionsType {
  selectItem: (layerID: string, itemID: string) => SelectItemAction;
  selectToolDrawingItem: (
    sceneComponentType: string
  ) => SelectToolDrawingItemAction;
  updateDrawingItem: (
    layerID: string,
    x: number,
    y: number
  ) => UpdateDrawingItemAction;
  endDrawingItem: (
    layerID: string,
    x: number,
    y: number
  ) => EndDrawingItemAction;
  beginDraggingItem: (
    layerID: string,
    itemID: string,
    x: number,
    y: number
  ) => BeginDraggingItemAction;
  updateDraggingItem: (x: number, y: number) => UpdateDraggingItemAction;
  endDraggingItem: (x: number, y: number) => EndDraggingItemAction;
  beginRotatingItem: (
    layerID: string,
    itemID: string,
    x: number,
    y: number
  ) => BeginRotatingItemAction;
  updateRotatingItem: (x: number, y: number) => UpdateRotatingItemAction;
  endRotatingItem: (x: number, y: number) => EndRotatingItemAction;
}

// Action Types
export interface SelectItemAction {
  type: typeof SELECT_ITEM;
  layerID: string;
  itemID: string;
}

export interface SelectToolDrawingItemAction {
  type: typeof SELECT_TOOL_DRAWING_ITEM;
  sceneComponentType: string;
}

export interface UpdateDrawingItemAction {
  type: typeof UPDATE_DRAWING_ITEM;
  layerID: string;
  x: number;
  y: number;
}

export interface EndDrawingItemAction {
  type: typeof END_DRAWING_ITEM;
  layerID: string;
  x: number;
  y: number;
}

export interface BeginDraggingItemAction {
  type: typeof BEGIN_DRAGGING_ITEM;
  layerID: string;
  itemID: string;
  x: number;
  y: number;
}

export interface UpdateDraggingItemAction {
  type: typeof UPDATE_DRAGGING_ITEM;
  x: number;
  y: number;
}

export interface EndDraggingItemAction {
  type: typeof END_DRAGGING_ITEM;
  x: number;
  y: number;
}

export interface BeginRotatingItemAction {
  type: typeof BEGIN_ROTATING_ITEM;
  layerID: string;
  itemID: string;
  x: number;
  y: number;
}

export interface UpdateRotatingItemAction {
  type: typeof UPDATE_ROTATING_ITEM;
  x: number;
  y: number;
}

export interface EndRotatingItemAction {
  type: typeof END_ROTATING_ITEM;
  x: number;
  y: number;
}

// Items Actions Union
export type ItemsActions =
  | SelectItemAction
  | SelectToolDrawingItemAction
  | UpdateDrawingItemAction
  | EndDrawingItemAction
  | BeginDraggingItemAction
  | UpdateDraggingItemAction
  | EndDraggingItemAction
  | BeginRotatingItemAction
  | UpdateRotatingItemAction
  | EndRotatingItemAction;

  // Functions
export function selectItem(layerID: string, itemID: string): SelectItemAction {
  return {
    type: SELECT_ITEM,
    layerID,
    itemID,
  };
}

export function selectToolDrawingItem(
  sceneComponentType: string
): SelectToolDrawingItemAction {
  return {
    type: SELECT_TOOL_DRAWING_ITEM,
    sceneComponentType,
  };
}

export function updateDrawingItem(
  layerID: string,
  x: number,
  y: number
): UpdateDrawingItemAction {
  return {
    type: UPDATE_DRAWING_ITEM,
    layerID,
    x,
    y,
  };
}

export function endDrawingItem(
  layerID: string,
  x: number,
  y: number
): EndDrawingItemAction {
  return {
    type: END_DRAWING_ITEM,
    layerID,
    x,
    y,
  };
}

export function beginDraggingItem(
  layerID: string,
  itemID: string,
  x: number,
  y: number
): BeginDraggingItemAction {
  return {
    type: BEGIN_DRAGGING_ITEM,
    layerID,
    itemID,
    x,
    y,
  };
}

export function updateDraggingItem(
  x: number,
  y: number
): UpdateDraggingItemAction {
  return {
    type: UPDATE_DRAGGING_ITEM,
    x,
    y,
  };
}

export function endDraggingItem(x: number, y: number): EndDraggingItemAction {
  return {
    type: END_DRAGGING_ITEM,
    x,
    y,
  };
}

export function beginRotatingItem(
  layerID: string,
  itemID: string,
  x: number,
  y: number
): BeginRotatingItemAction {
  return {
    type: BEGIN_ROTATING_ITEM,
    layerID,
    itemID,
    x,
    y,
  };
}

export function updateRotatingItem(
  x: number,
  y: number
): UpdateRotatingItemAction {
  return {
    type: UPDATE_ROTATING_ITEM,
    x,
    y,
  };
}

export function endRotatingItem(x: number, y: number): EndRotatingItemAction {
  return {
    type: END_ROTATING_ITEM,
    x,
    y,
  };
}