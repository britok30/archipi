import { GROUP_ACTIONS } from "../utils/constants";

export interface GroupsActionsType {
  addGroup: () => AddGroupAction;
  addGroupFromSelected: () => AddGroupFromSelectedAction;
  selectGroup: (groupID: string) => SelectGroupAction;
  unselectGroup: (groupID: string) => UnselectGroupAction;
  addToGroup: (
    groupID: string,
    layerID: string,
    elementPrototype: string,
    elementID: string
  ) => AddToGroupAction;
  removeFromGroup: (
    groupID: string,
    layerID: string,
    elementPrototype: string,
    elementID: string
  ) => RemoveFromGroupAction;
  setGroupAttributes: (
    groupID: string,
    attributes: Record<string, any>
  ) => SetGroupAttributesAction;
  setGroupProperties: (
    groupID: string,
    properties: Record<string, any>
  ) => SetGroupPropertiesAction;
  setGroupBarycenter: (
    groupID: string,
    barycenter: { x: number; y: number }
  ) => SetGroupBarycenterAction;
  removeGroup: (groupID: string) => RemoveGroupAction;
  removeGroupAndDeleteElements: (
    groupID: string
  ) => RemoveGroupAndDeleteElementsAction;
  groupTranslate: (
    groupID: string,
    x: number,
    y: number
  ) => GroupTranslateAction;
  groupRotate: (groupID: string, rotation: number) => GroupRotateAction;
}

// Action Types
export interface AddGroupAction {
  type: typeof GROUP_ACTIONS.ADD_GROUP;
}

export interface AddGroupFromSelectedAction {
  type: typeof GROUP_ACTIONS.ADD_GROUP_FROM_SELECTED;
}

export interface SelectGroupAction {
  type: typeof GROUP_ACTIONS.SELECT_GROUP;
  groupID: string;
}

export interface UnselectGroupAction {
  type: typeof GROUP_ACTIONS.UNSELECT_GROUP;
  groupID: string;
}

export interface AddToGroupAction {
  type: typeof GROUP_ACTIONS.ADD_TO_GROUP;
  groupID: string;
  layerID: string;
  elementPrototype: string;
  elementID: string;
}

export interface RemoveFromGroupAction {
  type: typeof GROUP_ACTIONS.REMOVE_FROM_GROUP;
  groupID: string;
  layerID: string;
  elementPrototype: string;
  elementID: string;
}

export interface SetGroupAttributesAction {
  type: typeof GROUP_ACTIONS.SET_GROUP_ATTRIBUTES;
  groupID: string;
  attributes: Record<string, any>;
}

export interface SetGroupPropertiesAction {
  type: typeof GROUP_ACTIONS.SET_GROUP_PROPERTIES;
  groupID: string;
  properties: Record<string, any>;
}

export interface SetGroupBarycenterAction {
  type: typeof GROUP_ACTIONS.SET_GROUP_BARYCENTER;
  groupID: string;
  barycenter: { x: number; y: number };
}

export interface RemoveGroupAction {
  type: typeof GROUP_ACTIONS.REMOVE_GROUP;
  groupID: string;
}

export interface RemoveGroupAndDeleteElementsAction {
  type: typeof GROUP_ACTIONS.REMOVE_GROUP_AND_DELETE_ELEMENTS;
  groupID: string;
}

export interface GroupTranslateAction {
  type: typeof GROUP_ACTIONS.GROUP_TRANSLATE;
  groupID: string;
  x: number;
  y: number;
}

export interface GroupRotateAction {
  type: typeof GROUP_ACTIONS.GROUP_ROTATE;
  groupID: string;
  rotation: number;
}

// Group Actions Union
export type GroupActions =
  | AddGroupAction
  | AddGroupFromSelectedAction
  | SelectGroupAction
  | UnselectGroupAction
  | AddToGroupAction
  | RemoveFromGroupAction
  | SetGroupAttributesAction
  | SetGroupPropertiesAction
  | SetGroupBarycenterAction
  | RemoveGroupAction
  | RemoveGroupAndDeleteElementsAction
  | GroupTranslateAction
  | GroupRotateAction;

// Functions
export function addGroup(): AddGroupAction {
  return {
    type: GROUP_ACTIONS.ADD_GROUP,
  };
}

export function addGroupFromSelected(): AddGroupFromSelectedAction {
  return {
    type: GROUP_ACTIONS.ADD_GROUP_FROM_SELECTED,
  };
}

export function selectGroup(groupID: string): SelectGroupAction {
  return {
    type: GROUP_ACTIONS.SELECT_GROUP,
    groupID,
  };
}

export function unselectGroup(groupID: string): UnselectGroupAction {
  return {
    type: GROUP_ACTIONS.UNSELECT_GROUP,
    groupID,
  };
}

export function addToGroup(
  groupID: string,
  layerID: string,
  elementPrototype: string,
  elementID: string
): AddToGroupAction {
  return {
    type: GROUP_ACTIONS.ADD_TO_GROUP,
    groupID,
    layerID,
    elementPrototype,
    elementID,
  };
}

export function removeFromGroup(
  groupID: string,
  layerID: string,
  elementPrototype: string,
  elementID: string
): RemoveFromGroupAction {
  return {
    type: GROUP_ACTIONS.REMOVE_FROM_GROUP,
    groupID,
    layerID,
    elementPrototype,
    elementID,
  };
}

export function setGroupAttributes(
  groupID: string,
  attributes: Record<string, any>
): SetGroupAttributesAction {
  return {
    type: GROUP_ACTIONS.SET_GROUP_ATTRIBUTES,
    groupID,
    attributes,
  };
}

export function setGroupProperties(
  groupID: string,
  properties: Record<string, any>
): SetGroupPropertiesAction {
  return {
    type: GROUP_ACTIONS.SET_GROUP_PROPERTIES,
    groupID,
    properties,
  };
}

export function setGroupBarycenter(
  groupID: string,
  barycenter: { x: number; y: number }
): SetGroupBarycenterAction {
  return {
    type: GROUP_ACTIONS.SET_GROUP_BARYCENTER,
    groupID,
    barycenter,
  };
}

export function removeGroup(groupID: string): RemoveGroupAction {
  return {
    type: GROUP_ACTIONS.REMOVE_GROUP,
    groupID,
  };
}

export function removeGroupAndDeleteElements(
  groupID: string
): RemoveGroupAndDeleteElementsAction {
  return {
    type: GROUP_ACTIONS.REMOVE_GROUP_AND_DELETE_ELEMENTS,
    groupID,
  };
}

export function groupTranslate(
  groupID: string,
  x: number,
  y: number
): GroupTranslateAction {
  return {
    type: GROUP_ACTIONS.GROUP_TRANSLATE,
    groupID,
    x,
    y,
  };
}

export function groupRotate(
  groupID: string,
  rotation: number
): GroupRotateAction {
  return {
    type: GROUP_ACTIONS.GROUP_ROTATE,
    groupID,
    rotation,
  };
}
