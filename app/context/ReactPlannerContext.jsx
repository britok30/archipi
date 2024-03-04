"use client";

import { createContext } from "react";

const defaultValue = {
  state: {},
  translator: null,
  catalog: null,
  projectActions: {},
  sceneActions: {},
  linesActions: {},
  holesActions: {},
  verticesActions: {},
  itemsActions: {},
  areaActions: {},
  viewer2DActions: {},
  viewer3DActions: {},
  groupsActions: {},
  customActions: {},
  store: null,
};

let ReactPlannerContext = createContext(defaultValue);

export default ReactPlannerContext;
