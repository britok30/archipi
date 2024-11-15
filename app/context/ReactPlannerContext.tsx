"use client";

import { createContext } from "react";
import { AreaActionsType } from "../actions/area-actions";
import { HolesActionsType } from "../actions/holes-actions";
import { ItemsActionsType } from "../actions/items-actions";
import { LinesActionsType } from "../actions/lines-actions";
import { GroupsActionsType } from "../actions/group-actions";
import { ProjectActionsType } from "../actions/project-actions";
import { SceneActionsType } from "../actions/scene-actions";
import { VertexActionsType } from "../actions/vertices-actions";
import { Viewer2DActionsType } from "../actions/viewer2d-actions";
import { Viewer3DActionsType } from "../actions/viewer3d-actions";

interface ReactPlannerContextType {
  state: Record<string, any>;
  areaActions: AreaActionsType;
  translator: null | any;
  catalog: null | any;
  projectActions: ProjectActionsType;
  sceneActions: SceneActionsType;
  linesActions: LinesActionsType;
  holesActions: HolesActionsType;
  verticesActions: VertexActionsType;
  itemsActions: ItemsActionsType;
  viewer2DActions: Viewer2DActionsType;
  viewer3DActions: Viewer3DActionsType;
  groupsActions: GroupsActionsType;
  customActions: Record<string, any>;
  store: null | any;
}

const defaultValue: ReactPlannerContextType = {
  state: {},
  translator: null,
  catalog: null,
  projectActions: {
    loadProject: (sceneJSON) => ({ type: "LOAD_PROJECT", sceneJSON }),
    newProject: () => ({ type: "NEW_PROJECT" }),
    saveProject: () => ({ type: "SAVE_PROJECT" }),
    openCatalog: () => ({ type: "OPEN_CATALOG" }),
    changeCatalogPage: (newPage, oldPage) => ({
      type: "CHANGE_CATALOG_PAGE",
      newPage,
      oldPage,
    }),
    goBackToCatalogPage: (newPage) => ({
      type: "GO_BACK_TO_CATALOG_PAGE",
      newPage,
    }),
    selectToolEdit: () => ({ type: "SELECT_TOOL_EDIT" }),
    unselectAll: () => ({ type: "UNSELECT_ALL" }),
    setProperties: (properties) => ({ type: "SET_PROPERTIES", properties }),
    setItemsAttributes: (itemsAttributes) => ({
      type: "SET_ITEMS_ATTRIBUTES",
      itemsAttributes,
    }),
    setLinesAttributes: (linesAttributes) => ({
      type: "SET_LINES_ATTRIBUTES",
      linesAttributes,
    }),
    setHolesAttributes: (holesAttributes) => ({
      type: "SET_HOLES_ATTRIBUTES",
      holesAttributes,
    }),
    remove: () => ({ type: "REMOVE" }),
    undo: () => ({ type: "UNDO" }),
    redo: () => ({ type: "REDO" }),
    rollback: () => ({ type: "ROLLBACK" }),
    openProjectConfigurator: () => ({ type: "OPEN_PROJECT_CONFIGURATOR" }),
    setProjectProperties: (properties) => ({
      type: "SET_PROJECT_PROPERTIES",
      properties,
    }),
    initCatalog: (catalog) => ({ type: "INIT_CATALOG", catalog }),
    updateMouseCoord: (coords) => ({ type: "UPDATE_MOUSE_COORDS", coords }),
    updateZoomScale: (scale) => ({ type: "UPDATE_ZOOM_SCALE", scale }),
    toggleSnap: (mask) => ({ type: "TOGGLE_SNAP", mask }),
    throwError: (error) => ({ type: "THROW_ERROR", error }),
    throwWarning: (warning) => ({ type: "THROW_WARNING", warning }),
    copyProperties: (properties) => ({ type: "COPY_PROPERTIES", properties }),
    pasteProperties: () => ({ type: "PASTE_PROPERTIES" }),
    pushLastSelectedCatalogElementToHistory: (element) => ({
      type: "PUSH_LAST_SELECTED_CATALOG_ELEMENT_TO_HISTORY",
      element,
    }),
    setAlterateState: () => ({ type: "ALTERATE_STATE" }),
    setMode: (mode) => ({ type: "SET_MODE", mode }),
    addHorizontalGuide: (coordinate) => ({
      type: "ADD_HORIZONTAL_GUIDE",
      coordinate,
    }),
    addVerticalGuide: (coordinate) => ({
      type: "ADD_VERTICAL_GUIDE",
      coordinate,
    }),
    addCircularGuide: (x, y, radius) => ({
      type: "ADD_CIRCULAR_GUIDE",
      x,
      y,
      radius,
    }),
    removeHorizontalGuide: (guideID) => ({
      type: "REMOVE_HORIZONTAL_GUIDE",
      guideID,
    }),
    removeVerticalGuide: (guideID) => ({
      type: "REMOVE_VERTICAL_GUIDE",
      guideID,
    }),
    removeCircularGuide: (guideID) => ({
      type: "REMOVE_CIRCULAR_GUIDE",
      guideID,
    }),
  },
  sceneActions: {
    selectLayer: (layerID) => ({
      type: "SELECT_LAYER",
      layerID,
    }),
    addLayer: (name, altitude) => ({
      type: "ADD_LAYER",
      name,
      altitude,
    }),
    setLayerProperties: (layerID, properties) => ({
      type: "SET_LAYER_PROPERTIES",
      layerID,
      properties,
    }),
    removeLayer: (layerID) => ({
      type: "REMOVE_LAYER",
      layerID,
    }),
  },
  linesActions: {
    selectLine: (layerID, lineID) => ({
      type: "SELECT_LINE",
      layerID,
      lineID,
    }),
    selectToolDrawingLine: (sceneComponentType) => ({
      type: "SELECT_TOOL_DRAWING_LINE",
      sceneComponentType,
    }),
    beginDrawingLine: (layerID, x, y, snapMask) => ({
      type: "BEGIN_DRAWING_LINE",
      layerID,
      x,
      y,
      snapMask,
    }),
    updateDrawingLine: (x, y, snapMask) => ({
      type: "UPDATE_DRAWING_LINE",
      x,
      y,
      snapMask,
    }),
    endDrawingLine: (x, y, snapMask) => ({
      type: "END_DRAWING_LINE",
      x,
      y,
      snapMask,
    }),
    beginDraggingLine: (layerID, lineID, x, y, snapMask) => ({
      type: "BEGIN_DRAGGING_LINE",
      layerID,
      lineID,
      x,
      y,
      snapMask,
    }),
    updateDraggingLine: (x, y, snapMask) => ({
      type: "UPDATE_DRAGGING_LINE",
      x,
      y,
      snapMask,
    }),
    endDraggingLine: (x, y, snapMask) => ({
      type: "END_DRAGGING_LINE",
      x,
      y,
      snapMask,
    }),
  },
  holesActions: {
    selectHole: (layerID, holeID) => ({
      type: "SELECT_HOLE",
      layerID,
      holeID,
    }),
    selectToolDrawingHole: (sceneComponentType) => ({
      type: "SELECT_TOOL_DRAWING_HOLE",
      sceneComponentType,
    }),
    updateDrawingHole: (layerID, x, y) => ({
      type: "UPDATE_DRAWING_HOLE",
      layerID,
      x,
      y,
    }),
    endDrawingHole: (layerID, x, y) => ({
      type: "END_DRAWING_HOLE",
      layerID,
      x,
      y,
    }),
    beginDraggingHole: (layerID, holeID, x, y) => ({
      type: "BEGIN_DRAGGING_HOLE",
      layerID,
      holeID,
      x,
      y,
    }),
    updateDraggingHole: (x, y) => ({
      type: "UPDATE_DRAGGING_HOLE",
      x,
      y,
    }),
    endDraggingHole: (x, y) => ({
      type: "END_DRAGGING_HOLE",
      x,
      y,
    }),
  },
  verticesActions: {
    beginDraggingVertex: (layerID, vertexID, x, y, snapMask) => ({
      type: "BEGIN_DRAGGING_VERTEX",
      layerID,
      vertexID,
      x,
      y,
      snapMask,
    }),
    updateDraggingVertex: (x, y, snapMask) => ({
      type: "UPDATE_DRAGGING_VERTEX",
      x,
      y,
      snapMask,
    }),
    endDraggingVertex: (x, y, snapMask) => ({
      type: "END_DRAGGING_VERTEX",
      x,
      y,
      snapMask,
    }),
  },
  itemsActions: {
    selectItem: (layerID, itemID) => ({
      type: "SELECT_ITEM",
      layerID,
      itemID,
    }),
    selectToolDrawingItem: (sceneComponentType) => ({
      type: "SELECT_TOOL_DRAWING_ITEM",
      sceneComponentType,
    }),
    updateDrawingItem: (layerID, x, y) => ({
      type: "UPDATE_DRAWING_ITEM",
      layerID,
      x,
      y,
    }),
    endDrawingItem: (layerID, x, y) => ({
      type: "END_DRAWING_ITEM",
      layerID,
      x,
      y,
    }),
    beginDraggingItem: (layerID, itemID, x, y) => ({
      type: "BEGIN_DRAGGING_ITEM",
      layerID,
      itemID,
      x,
      y,
    }),
    updateDraggingItem: (x, y) => ({
      type: "UPDATE_DRAGGING_ITEM",
      x,
      y,
    }),
    endDraggingItem: (x, y) => ({
      type: "END_DRAGGING_ITEM",
      x,
      y,
    }),
    beginRotatingItem: (layerID, itemID, x, y) => ({
      type: "BEGIN_ROTATING_ITEM",
      layerID,
      itemID,
      x,
      y,
    }),
    updateRotatingItem: (x, y) => ({
      type: "UPDATE_ROTATING_ITEM",
      x,
      y,
    }),
    endRotatingItem: (x, y) => ({
      type: "END_ROTATING_ITEM",
      x,
      y,
    }),
  },
  areaActions: {
    selectArea: (layerID: string, areaID: string) => ({
      type: "SELECT_AREA",
      layerID,
      areaID,
    }),
  },
  viewer2DActions: {
    updateCameraView: (value) => ({
      type: "UPDATE_2D_CAMERA",
      value,
    }),
    selectToolPan: () => ({
      type: "SELECT_TOOL_PAN",
    }),
    selectToolZoomOut: () => ({
      type: "SELECT_TOOL_ZOOM_OUT",
    }),
    selectToolZoomIn: () => ({
      type: "SELECT_TOOL_ZOOM_IN",
    }),
    fitSelection: (value) => ({
      type: "FIT_SELECTION",
      value,
    }),
  },
  viewer3DActions: {
    selectTool3DView: () => ({
      type: "SELECT_TOOL_3D_VIEW",
    }),
    selectTool3DFirstPerson: () => ({
      type: "SELECT_TOOL_3D_FIRST_PERSON",
    }),
  },
  groupsActions: {
    addGroup: () => ({ type: "ADD_GROUP" }),
    addGroupFromSelected: () => ({ type: "ADD_GROUP_FROM_SELECTED" }),
    selectGroup: (groupID: string) => ({ type: "SELECT_GROUP", groupID }),
    unselectGroup: (groupID: string) => ({ type: "UNSELECT_GROUP", groupID }),
    addToGroup: (groupID, layerID, elementPrototype, elementID) => ({
      type: "ADD_TO_GROUP",
      groupID,
      layerID,
      elementPrototype,
      elementID,
    }),
    removeFromGroup: (groupID, layerID, elementPrototype, elementID) => ({
      type: "REMOVE_FROM_GROUP",
      groupID,
      layerID,
      elementPrototype,
      elementID,
    }),
    setGroupAttributes: (groupID, attributes) => ({
      type: "SET_GROUP_ATTRIBUTES",
      groupID,
      attributes,
    }),
    setGroupProperties: (groupID, properties) => ({
      type: "SET_GROUP_PROPERTIES",
      groupID,
      properties,
    }),
    setGroupBarycenter: (groupID, barycenter) => ({
      type: "SET_GROUP_BARYCENTER",
      groupID,
      barycenter,
    }),
    removeGroup: (groupID) => ({ type: "REMOVE_GROUP", groupID }),
    removeGroupAndDeleteElements: (groupID) => ({
      type: "REMOVE_GROUP_AND_DELETE_ELEMENTS",
      groupID,
    }),
    groupTranslate: (groupID, x, y) => ({
      type: "GROUP_TRANSLATE",
      groupID,
      x,
      y,
    }),
    groupRotate: (groupID, rotation) => ({
      type: "GROUP_ROTATE",
      groupID,
      rotation,
    }),
  },
  customActions: {},
  store: null,
};

const ReactPlannerContext =
  createContext<ReactPlannerContextType>(defaultValue);

export default ReactPlannerContext;
