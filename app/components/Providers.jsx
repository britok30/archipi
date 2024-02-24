"use client";

import React from "react";
import { Models as PlannerModels } from "../models";
import { reducer as PlannerReducer } from "../reducers";
import { Provider } from "react-redux";
import { Map } from "immutable";
import { createStore } from "redux";

// Define state
let AppState = Map({
  archipi: new PlannerModels.State(),
});

// Define reducer
let reducer = (state, action) => {
  state = state || AppState;
  state = state.update("archipi", (plannerState) =>
    PlannerReducer(plannerState, action)
  );
  return state;
};

// Init store
export let store = createStore(reducer, null, (f) => f);

function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export default Providers;
