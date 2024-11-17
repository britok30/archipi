import {
  Middleware,
} from "@reduxjs/toolkit";
import { Models } from "../models";

export const TIMEOUT_DELAY = 500;

export type State = Models.State;
export type RootState = Map<string, State>;

export const createAutosaveMiddleware = (
  key: string,
  delay: number = TIMEOUT_DELAY
): Middleware => {
  let timeout: NodeJS.Timeout | null = null;

  return (store) => (next) => (action) => {
    const result = next(action);

    if (typeof window === "undefined" || !window.localStorage) {
      return result;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      const state = store.getState();
      const scene = state.get("archipi").get("scene");
      try {
        window.localStorage.setItem(key, JSON.stringify(scene.toJS()));
      } catch (error) {
        console.error("Failed to autosave state:", error);
      }
    }, delay);

    return result;
  };
};
