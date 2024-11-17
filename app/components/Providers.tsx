"use client";
import {
  Action,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Map } from "immutable";
import { Models as PlannerModels } from "../models";
import { reducer as PlannerReducer } from "../reducers";
import { useEffect } from "react";
import { AnyAction, Middleware } from "redux";
import { loadProject } from "../actions/project-actions";
import {
  createAutosaveMiddleware,
  TIMEOUT_DELAY,
} from "../customMiddlewares/autosave";
import { createKeyboardMiddleware } from "../customMiddlewares/keyboard";

// Define state
const AppState = Map({
  archipi: new PlannerModels.State(),
});

// Define reducer
const rootReducer = (state = AppState, action: AnyAction) => {
  return state.update("archipi", (plannerState) =>
    PlannerReducer(plannerState, action)
  );
};

// Create store with middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const customMiddleware = [
      createAutosaveMiddleware("archipi", TIMEOUT_DELAY),
      createKeyboardMiddleware(),
    ] as Middleware[];

    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
      thunk: true,
    }).concat(customMiddleware);
  },
  preloadedState: AppState as any,
});

export const loadSavedState = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const savedData = window.localStorage.getItem("archipi");
  if (savedData) {
    try {
      const json = JSON.parse(savedData);
      store.dispatch(loadProject(json));
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
  }
};

function Providers({ children }) {
  useEffect(() => {
    loadSavedState();

    // Clean up event listeners when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", () => {});
        window.removeEventListener("keyup", () => {});
      }
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

export default Providers;
