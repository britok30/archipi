import { usePlannerStore } from '../usePlannerStore';
import {
  Mode,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
} from '../types';

const AUTOSAVE_KEY = 'archipi';
const AUTOSAVE_DELAY = 500;

// Mid-gesture scenes contain transient preview objects (rubber-band lines,
// in-flight drags) that must never be persisted
const TRANSIENT_MODES: ReadonlySet<Mode> = new Set<Mode>([
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
]);

/**
 * Sets up autosave functionality that persists the scene to localStorage
 * whenever it changes, with a debounce delay.
 */
export function setupAutosave(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let autosaveTimeout: NodeJS.Timeout | null = null;

  const unsubscribe = usePlannerStore.subscribe(
    (state) => state.scene,
    () => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }

      autosaveTimeout = setTimeout(() => {
        // Skip persisting mid-gesture scenes
        const { mode, scene } = usePlannerStore.getState();
        if (TRANSIENT_MODES.has(mode)) {
          return;
        }

        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(scene));
        } catch (error) {
          console.error('Failed to autosave:', error);
        }
      }, AUTOSAVE_DELAY);
    }
  );

  return () => {
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }
    unsubscribe();
  };
}

/**
 * Loads the saved scene from localStorage.
 * Returns null if no saved scene exists or if parsing fails; a corrupt
 * save is removed so it cannot crash-loop on every startup.
 */
export function loadSavedScene(): ReturnType<typeof usePlannerStore.getState>['scene'] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load saved scene:', error);
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Clears the saved scene from localStorage.
 */
export function clearSavedScene(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (error) {
    console.error('Failed to clear saved scene:', error);
  }
}
