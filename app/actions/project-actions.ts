import {
  NEW_PROJECT,
  LOAD_PROJECT,
  SAVE_PROJECT,
  OPEN_CATALOG,
  SELECT_TOOL_EDIT,
  UNSELECT_ALL,
  SET_PROPERTIES,
  SET_ITEMS_ATTRIBUTES,
  SET_LINES_ATTRIBUTES,
  SET_HOLES_ATTRIBUTES,
  REMOVE,
  UNDO,
  REDO,
  ROLLBACK,
  OPEN_PROJECT_CONFIGURATOR,
  SET_PROJECT_PROPERTIES,
  INIT_CATALOG,
  UPDATE_MOUSE_COORDS,
  UPDATE_ZOOM_SCALE,
  TOGGLE_SNAP,
  CHANGE_CATALOG_PAGE,
  GO_BACK_TO_CATALOG_PAGE,
  THROW_ERROR,
  THROW_WARNING,
  COPY_PROPERTIES,
  PASTE_PROPERTIES,
  PUSH_LAST_SELECTED_CATALOG_ELEMENT_TO_HISTORY,
  ALTERATE_STATE,
  SET_MODE,
  ADD_HORIZONTAL_GUIDE,
  ADD_VERTICAL_GUIDE,
  ADD_CIRCULAR_GUIDE,
  REMOVE_HORIZONTAL_GUIDE,
  REMOVE_VERTICAL_GUIDE,
  REMOVE_CIRCULAR_GUIDE,
} from "../utils/constants";

export interface ProjectActionsType {
  loadProject: (sceneJSON: any) => LoadProjectAction;
  newProject: () => NewProjectAction;
  saveProject: () => SaveProjectAction;
  openCatalog: () => OpenCatalogAction;
  changeCatalogPage: (
    newPage: string,
    oldPage: string
  ) => ChangeCatalogPageAction;
  goBackToCatalogPage: (newPage: string) => GoBackToCatalogPageAction;
  selectToolEdit: () => SelectToolEditAction;
  unselectAll: () => UnselectAllAction;
  setProperties: (properties: Record<string, any>) => SetPropertiesAction;
  setItemsAttributes: (itemsAttributes: any) => SetItemsAttributesAction;
  setLinesAttributes: (linesAttributes: any) => SetLinesAttributesAction;
  setHolesAttributes: (holesAttributes: any) => SetHolesAttributesAction;
  remove: () => RemoveAction;
  undo: () => UndoAction;
  redo: () => RedoAction;
  rollback: () => RollbackAction;
  openProjectConfigurator: () => OpenProjectConfiguratorAction;
  setProjectProperties: (
    properties: Record<string, any>
  ) => SetProjectPropertiesAction;
  initCatalog: (catalog: any) => InitCatalogAction;
  updateMouseCoord: (coords: {
    x: number;
    y: number;
  }) => UpdateMouseCoordAction;
  updateZoomScale: (scale: number) => UpdateZoomScaleAction;
  toggleSnap: (mask: string) => ToggleSnapAction;
  throwError: (error: string) => ThrowErrorAction;
  throwWarning: (warning: string) => ThrowWarningAction;
  copyProperties: (properties: Record<string, any>) => CopyPropertiesAction;
  pasteProperties: () => PastePropertiesAction;
  pushLastSelectedCatalogElementToHistory: (
    element: any
  ) => PushLastSelectedCatalogElementToHistoryAction;
  setAlterateState: () => SetAlterateStateAction;
  setMode: (mode: string) => SetModeAction;
  addHorizontalGuide: (coordinate: number) => AddHorizontalGuideAction;
  addVerticalGuide: (coordinate: number) => AddVerticalGuideAction;
  addCircularGuide: (
    x: number,
    y: number,
    radius: number
  ) => AddCircularGuideAction;
  removeHorizontalGuide: (guideID: string) => RemoveHorizontalGuideAction;
  removeVerticalGuide: (guideID: string) => RemoveVerticalGuideAction;
  removeCircularGuide: (guideID: string) => RemoveCircularGuideAction;
}

export interface NewProjectAction {
  type: typeof NEW_PROJECT;
}

export interface LoadProjectAction {
  type: typeof LOAD_PROJECT;
  sceneJSON: any; // Adjust this type based on the structure of your sceneJSON
}

export interface SaveProjectAction {
  type: typeof SAVE_PROJECT;
}

export interface OpenCatalogAction {
  type: typeof OPEN_CATALOG;
}

export interface ChangeCatalogPageAction {
  type: typeof CHANGE_CATALOG_PAGE;
  newPage: string;
  oldPage: string;
}

export interface GoBackToCatalogPageAction {
  type: typeof GO_BACK_TO_CATALOG_PAGE;
  newPage: string;
}

export interface SelectToolEditAction {
  type: typeof SELECT_TOOL_EDIT;
}

export interface UnselectAllAction {
  type: typeof UNSELECT_ALL;
}

export interface SetPropertiesAction {
  type: typeof SET_PROPERTIES;
  properties: Record<string, any>;
}

export interface SetItemsAttributesAction {
  type: typeof SET_ITEMS_ATTRIBUTES;
  itemsAttributes: any; // Update this type based on the structure of `itemsAttributes`
}

export interface SetLinesAttributesAction {
  type: typeof SET_LINES_ATTRIBUTES;
  linesAttributes: any; // Update this type based on the structure of `linesAttributes`
}

export interface SetHolesAttributesAction {
  type: typeof SET_HOLES_ATTRIBUTES;
  holesAttributes: any; // Update this type based on the structure of `holesAttributes`
}

export interface RemoveAction {
  type: typeof REMOVE;
}

export interface UndoAction {
  type: typeof UNDO;
}

export interface RedoAction {
  type: typeof REDO;
}

export interface RollbackAction {
  type: typeof ROLLBACK;
}

export interface OpenProjectConfiguratorAction {
  type: typeof OPEN_PROJECT_CONFIGURATOR;
}

export interface SetProjectPropertiesAction {
  type: typeof SET_PROJECT_PROPERTIES;
  properties: Record<string, any>;
}

export interface InitCatalogAction {
  type: typeof INIT_CATALOG;
  catalog: any; // Adjust this type based on your catalog's structure
}

export interface UpdateMouseCoordAction {
  type: typeof UPDATE_MOUSE_COORDS;
  coords: { x: number; y: number };
}

export interface UpdateZoomScaleAction {
  type: typeof UPDATE_ZOOM_SCALE;
  scale: number;
}

export interface ToggleSnapAction {
  type: typeof TOGGLE_SNAP;
  mask: string;
}

export interface ThrowErrorAction {
  type: typeof THROW_ERROR;
  error: string;
}

export interface ThrowWarningAction {
  type: typeof THROW_WARNING;
  warning: string;
}

export interface CopyPropertiesAction {
  type: typeof COPY_PROPERTIES;
  properties: Record<string, any>;
}

export interface PastePropertiesAction {
  type: typeof PASTE_PROPERTIES;
}

export interface PushLastSelectedCatalogElementToHistoryAction {
  type: typeof PUSH_LAST_SELECTED_CATALOG_ELEMENT_TO_HISTORY;
  element: any; // Update type based on your element's structure
}

export interface SetAlterateStateAction {
  type: typeof ALTERATE_STATE;
}

export interface SetModeAction {
  type: typeof SET_MODE;
  mode: string;
}

export interface AddHorizontalGuideAction {
  type: typeof ADD_HORIZONTAL_GUIDE;
  coordinate: number;
}

export interface AddVerticalGuideAction {
  type: typeof ADD_VERTICAL_GUIDE;
  coordinate: number;
}

export interface AddCircularGuideAction {
  type: typeof ADD_CIRCULAR_GUIDE;
  x: number;
  y: number;
  radius: number;
}

export interface RemoveHorizontalGuideAction {
  type: typeof REMOVE_HORIZONTAL_GUIDE;
  guideID: string;
}

export interface RemoveVerticalGuideAction {
  type: typeof REMOVE_VERTICAL_GUIDE;
  guideID: string;
}

export interface RemoveCircularGuideAction {
  type: typeof REMOVE_CIRCULAR_GUIDE;
  guideID: string;
}

// Project Actions Union
export type ProjectActions =
  | NewProjectAction
  | LoadProjectAction
  | SaveProjectAction
  | OpenCatalogAction
  | ChangeCatalogPageAction
  | GoBackToCatalogPageAction
  | SelectToolEditAction
  | UnselectAllAction
  | SetPropertiesAction
  | SetItemsAttributesAction
  | SetLinesAttributesAction
  | SetHolesAttributesAction
  | RemoveAction
  | UndoAction
  | RedoAction
  | RollbackAction
  | OpenProjectConfiguratorAction
  | SetProjectPropertiesAction
  | InitCatalogAction
  | UpdateMouseCoordAction
  | UpdateZoomScaleAction
  | ToggleSnapAction
  | ThrowErrorAction
  | ThrowWarningAction
  | CopyPropertiesAction
  | PastePropertiesAction
  | PushLastSelectedCatalogElementToHistoryAction
  | SetAlterateStateAction
  | SetModeAction
  | AddHorizontalGuideAction
  | AddVerticalGuideAction
  | AddCircularGuideAction
  | RemoveHorizontalGuideAction
  | RemoveVerticalGuideAction
  | RemoveCircularGuideAction;

export function newProject(): NewProjectAction {
  return { type: NEW_PROJECT };
}

export function loadProject(sceneJSON: any): LoadProjectAction {
  return { type: LOAD_PROJECT, sceneJSON };
}

export function saveProject(): SaveProjectAction {
  return { type: SAVE_PROJECT };
}

export function openCatalog(): OpenCatalogAction {
  return { type: OPEN_CATALOG };
}

export function changeCatalogPage(
  newPage: string,
  oldPage: string
): ChangeCatalogPageAction {
  return { type: CHANGE_CATALOG_PAGE, newPage, oldPage };
}

export function goBackToCatalogPage(
  newPage: string
): GoBackToCatalogPageAction {
  return { type: GO_BACK_TO_CATALOG_PAGE, newPage };
}

export function selectToolEdit(): SelectToolEditAction {
  return { type: SELECT_TOOL_EDIT };
}

export function unselectAll(): UnselectAllAction {
  return { type: UNSELECT_ALL };
}

export function setProperties(
  properties: Record<string, any>
): SetPropertiesAction {
  return { type: SET_PROPERTIES, properties };
}

export function setItemsAttributes(
  itemsAttributes: any
): SetItemsAttributesAction {
  return { type: SET_ITEMS_ATTRIBUTES, itemsAttributes };
}

export function setLinesAttributes(
  linesAttributes: any
): SetLinesAttributesAction {
  return { type: SET_LINES_ATTRIBUTES, linesAttributes };
}

export function setHolesAttributes(
  holesAttributes: any
): SetHolesAttributesAction {
  return { type: SET_HOLES_ATTRIBUTES, holesAttributes };
}

export function remove(): RemoveAction {
  return { type: REMOVE };
}

export function undo(): UndoAction {
  return { type: UNDO };
}

export function redo(): RedoAction {
  return { type: REDO };
}

export function rollback(): RollbackAction {
  return { type: ROLLBACK };
}

export function openProjectConfigurator(): OpenProjectConfiguratorAction {
  return { type: OPEN_PROJECT_CONFIGURATOR };
}

export function setProjectProperties(
  properties: Record<string, any>
): SetProjectPropertiesAction {
  return { type: SET_PROJECT_PROPERTIES, properties };
}

export function initCatalog(catalog: any): InitCatalogAction {
  return { type: INIT_CATALOG, catalog };
}

export function updateMouseCoord(coords: {
  x: number;
  y: number;
}): UpdateMouseCoordAction {
  return { type: UPDATE_MOUSE_COORDS, coords };
}

export function updateZoomScale(scale: number): UpdateZoomScaleAction {
  return { type: UPDATE_ZOOM_SCALE, scale };
}

export function toggleSnap(mask: string): ToggleSnapAction {
  return { type: TOGGLE_SNAP, mask };
}

export function throwError(error: string): ThrowErrorAction {
  return { type: THROW_ERROR, error };
}

export function throwWarning(warning: string): ThrowWarningAction {
  return { type: THROW_WARNING, warning };
}

export function copyProperties(
  properties: Record<string, any>
): CopyPropertiesAction {
  return { type: COPY_PROPERTIES, properties };
}

export function pasteProperties(): PastePropertiesAction {
  return { type: PASTE_PROPERTIES };
}

export function pushLastSelectedCatalogElementToHistory(
  element: any
): PushLastSelectedCatalogElementToHistoryAction {
  return { type: PUSH_LAST_SELECTED_CATALOG_ELEMENT_TO_HISTORY, element };
}

export function setAlterateState(): SetAlterateStateAction {
  return { type: ALTERATE_STATE };
}

export function setMode(mode: string): SetModeAction {
  return { type: SET_MODE, mode };
}

export function addHorizontalGuide(
  coordinate: number
): AddHorizontalGuideAction {
  return { type: ADD_HORIZONTAL_GUIDE, coordinate };
}

export function addVerticalGuide(coordinate: number): AddVerticalGuideAction {
  return { type: ADD_VERTICAL_GUIDE, coordinate };
}

export function addCircularGuide(
  x: number,
  y: number,
  radius: number
): AddCircularGuideAction {
  return { type: ADD_CIRCULAR_GUIDE, x, y, radius };
}

export function removeHorizontalGuide(
  guideID: string
): RemoveHorizontalGuideAction {
  return { type: REMOVE_HORIZONTAL_GUIDE, guideID };
}

export function removeVerticalGuide(
  guideID: string
): RemoveVerticalGuideAction {
  return { type: REMOVE_VERTICAL_GUIDE, guideID };
}

export function removeCircularGuide(
  guideID: string
): RemoveCircularGuideAction {
  return { type: REMOVE_CIRCULAR_GUIDE, guideID };
}
