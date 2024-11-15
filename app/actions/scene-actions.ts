import {
  SELECT_LAYER,
  ADD_LAYER,
  SET_LAYER_PROPERTIES,
  REMOVE_LAYER,
} from "../utils/constants";

export interface SceneActionsType {
  selectLayer: (layerID: string) => SelectLayerAction;
  addLayer: (name: string, altitude: number) => AddLayerAction;
  setLayerProperties: (
    layerID: string,
    properties: Record<string, any>
  ) => SetLayerPropertiesAction;
  removeLayer: (layerID: string) => RemoveLayerAction;
}

// Action Types
export interface SelectLayerAction {
  type: typeof SELECT_LAYER;
  layerID: string;
}

export interface AddLayerAction {
  type: typeof ADD_LAYER;
  name: string;
  altitude: number;
}

export interface SetLayerPropertiesAction {
  type: typeof SET_LAYER_PROPERTIES;
  layerID: string;
  properties: Record<string, any>;
}

export interface RemoveLayerAction {
  type: typeof REMOVE_LAYER;
  layerID: string;
}

// Scene Actions Union
export type SceneActions =
  | SelectLayerAction
  | AddLayerAction
  | SetLayerPropertiesAction
  | RemoveLayerAction;

// Functions
export function selectLayer(layerID: string): SelectLayerAction {
  return {
    type: SELECT_LAYER,
    layerID,
  };
}

export function addLayer(name: string, altitude: number): AddLayerAction {
  return {
    type: ADD_LAYER,
    name,
    altitude,
  };
}

export function setLayerProperties(
  layerID: string,
  properties: Record<string, any>
): SetLayerPropertiesAction {
  return {
    type: SET_LAYER_PROPERTIES,
    layerID,
    properties,
  };
}

export function removeLayer(layerID: string): RemoveLayerAction {
  return {
    type: REMOVE_LAYER,
    layerID,
  };
}
