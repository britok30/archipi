import { usePlannerStore } from '../usePlannerStore';
import {
  MODE_IDLE,
  MODE_3D_VIEW,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
} from '../types';

const KEYBOARD_BUTTON_CODE = {
  DELETE: 46,
  BACKSPACE: 8,
  ESC: 27,
  Z: 90,
  Y: 89,
  ALT: 18,
  C: 67,
  V: 86,
  CTRL: 17,
  ENTER: 13,
  TAB: 9,
} as const;

/**
 * Sets up keyboard shortcuts for the planner.
 * Returns a cleanup function to remove event listeners.
 */
export function setupKeyboardShortcuts(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const state = usePlannerStore.getState();
    const {
      mode,
      sceneHistory,
      undo,
      redo,
      remove,
      rollback,
      copyProperties,
      pasteProperties,
      alterateState,
      selectToolEdit,
      scene,
    } = state;

    // Don't handle keyboard events if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    switch (event.keyCode) {
      // Delete/Backspace - Remove selected elements
      case KEYBOARD_BUTTON_CODE.DELETE:
      case KEYBOARD_BUTTON_CODE.BACKSPACE:
        if (mode === MODE_IDLE || mode === MODE_3D_VIEW) {
          event.preventDefault();
          remove();
        }
        break;

      // Escape - Cancel current operation or unselect
      case KEYBOARD_BUTTON_CODE.ESC:
        event.preventDefault();
        if (mode === MODE_DRAWING_LINE) {
          // Stop drawing but keep already-placed walls
          state.stopDrawingLine();
        } else if (
          mode === MODE_DRAWING_HOLE ||
          mode === MODE_DRAWING_ITEM ||
          mode === MODE_DRAGGING_LINE ||
          mode === MODE_DRAGGING_VERTEX ||
          mode === MODE_DRAGGING_ITEM ||
          mode === MODE_DRAGGING_HOLE
        ) {
          rollback();
        } else {
          selectToolEdit();
        }
        break;

      // Ctrl+Z - Undo
      case KEYBOARD_BUTTON_CODE.Z:
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
          if (sceneHistory.past.length > 0) {
            event.preventDefault();
            undo();
          }
        }
        // Ctrl+Shift+Z - Redo (alternative to Ctrl+Y)
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
          if (sceneHistory.future.length > 0) {
            event.preventDefault();
            redo();
          }
        }
        break;

      // Ctrl+Y - Redo
      case KEYBOARD_BUTTON_CODE.Y:
        if (event.ctrlKey || event.metaKey) {
          if (sceneHistory.future.length > 0) {
            event.preventDefault();
            redo();
          }
        }
        break;

      // Ctrl+C - Copy properties
      case KEYBOARD_BUTTON_CODE.C:
        if (event.ctrlKey || event.metaKey) {
          const layerId = scene.selectedLayer;
          if (layerId && scene.layers[layerId]) {
            const layer = scene.layers[layerId];
            const selectedIds = [
              ...layer.selected.lines,
              ...layer.selected.holes,
              ...layer.selected.items,
              ...layer.selected.areas,
            ];

            if (selectedIds.length === 1) {
              const element =
                layer.lines[selectedIds[0]] ||
                layer.holes[selectedIds[0]] ||
                layer.items[selectedIds[0]] ||
                layer.areas[selectedIds[0]];

              if (element) {
                event.preventDefault();
                copyProperties({ ...element.properties });
              }
            }
          }
        }
        break;

      // Ctrl+V - Paste properties
      case KEYBOARD_BUTTON_CODE.V:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          pasteProperties();
        }
        break;

      // Alt - Toggle alterate state
      case KEYBOARD_BUTTON_CODE.ALT:
        event.preventDefault();
        alterateState();
        break;

      default:
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const { alterateState, alterate } = usePlannerStore.getState();

    // Release Alt key
    if (event.keyCode === KEYBOARD_BUTTON_CODE.ALT && alterate) {
      alterateState();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}
