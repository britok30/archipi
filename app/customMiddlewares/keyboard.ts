import {
  MODE_IDLE,
  MODE_3D_FIRST_PERSON,
  MODE_3D_VIEW,
  MODE_SNAPPING,
  KEYBOARD_BUTTON_CODE,
} from "../utils/constants";

import {
  rollback,
  undo,
  redo,
  remove,
  toggleSnap,
  copyProperties,
  pasteProperties,
  setAlterateState,
} from "../actions/project-actions";
import { Middleware } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { List } from "immutable";

export interface Selected {
  holes: List<string>;
  areas: List<string>;
  items: List<string>;
  lines: List<string>;
  size?: number;
}

export interface Layer {
  selected: Selected;
  holes: Map<string, any>;
  areas: Map<string, any>;
  items: Map<string, any>;
  lines: Map<string, any>;
}

export const createKeyboardMiddleware = (): Middleware => {
  return (store) => {
    if (typeof window === "undefined") {
      return (next) => (action) => next(action);
    }

    // Keydown handler
    const handleKeyDown = (event: KeyboardEvent) => {
      const state = store.getState().get("archipi");
      const mode = state.get("mode");

      switch (event.keyCode) {
        case KEYBOARD_BUTTON_CODE.BACKSPACE:
        case KEYBOARD_BUTTON_CODE.DELETE: {
          if ([MODE_IDLE, MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode)) {
            store.dispatch(remove() as AnyAction);
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.ESC: {
          store.dispatch(rollback() as AnyAction);
          break;
        }
        case KEYBOARD_BUTTON_CODE.Y: {
          let sceneHistory = state.sceneHistory;

          if (
            (event.getModifierState("Control") ||
              event.getModifierState("Meta")) &&
            sceneHistory.redoList.size > 0
          ) {
            store.dispatch(redo() as AnyAction);
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.Z: {
          let sceneHistory = state.sceneHistory;

          if (
            (event.getModifierState("Control") ||
              event.getModifierState("Meta")) &&
            sceneHistory.undoList.size > 1
          ) {
            store.dispatch(undo() as AnyAction);
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.ALT: {
          // if (MODE_SNAPPING.includes(mode)) {
          //   store.dispatch(toggleSnap(state.snapMask.merge({
          //     SNAP_POINT: false,
          //     SNAP_LINE: false,
          //     SNAP_SEGMENT: false,
          //     SNAP_GRID: false,
          //     SNAP_GUIDE: false,
          //     tempSnapConfiguartion: state.snapMask.toJS()
          //   })));
          // }
          break;
        }
        case KEYBOARD_BUTTON_CODE.C: {
          const selectedLayer = state.getIn(["scene", "selectedLayer"]);
          const selected = state.getIn([
            "scene",
            "layers",
            selectedLayer,
            "selected",
          ]) as Selected;

          if (
            (mode === MODE_IDLE || mode === MODE_3D_VIEW) &&
            (selected.holes.size ||
              selected.areas.size ||
              selected.items.size ||
              selected.lines.size)
          ) {
            if (selected.holes.size) {
              const hole = state.getIn([
                "scene",
                "layers",
                selectedLayer,
                "holes",
                selected.holes.get(0),
              ]);
              store.dispatch(
                copyProperties(hole.get("properties")) as AnyAction
              );
            } else if (selected.areas.size) {
              const area = state.getIn([
                "scene",
                "layers",
                selectedLayer,
                "areas",
                selected.areas.get(0),
              ]);
              store.dispatch(copyProperties(area.properties) as AnyAction);
            } else if (selected.items.size) {
              const item = state.getIn([
                "scene",
                "layers",
                selectedLayer,
                "items",
                selected.items.get(0),
              ]);
              store.dispatch(copyProperties(item.properties) as AnyAction);
            } else if (selected.lines.size) {
              const line = state.getIn([
                "scene",
                "layers",
                selectedLayer,
                "lines",
                selected.lines.get(0),
              ]);
              store.dispatch(copyProperties(line.properties) as AnyAction);
            }
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.V: {
          store.dispatch(pasteProperties() as AnyAction);
          break;
        }
        case KEYBOARD_BUTTON_CODE.CTRL: {
          store.dispatch(setAlterateState() as AnyAction);
          break;
        }
      }
    };

    // Keyup handler
    const handleKeyUp = (event: KeyboardEvent) => {
      const state = store.getState().get("archipi");
      const mode = state.get("mode");

      switch (event.keyCode) {
        case KEYBOARD_BUTTON_CODE.ALT: {
          // if (MODE_SNAPPING.includes(mode)) {
          //   store.dispatch(toggleSnap(state.snapMask.merge(
          //     state.snapMask.get('tempSnapConfiguartion')
          //   )));
          // }
          break;
        }
        case KEYBOARD_BUTTON_CODE.CTRL: {
          store.dispatch(setAlterateState() as AnyAction);
          break;
        }
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Return middleware function
    return (next) => (action) => {
      return next(action);
    };
  };
};
