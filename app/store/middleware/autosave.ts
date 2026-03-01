import { usePlannerStore } from '../usePlannerStore';

const AUTOSAVE_KEY = 'archipi';
const AUTOSAVE_DELAY = 500;

let autosaveTimeout: NodeJS.Timeout | null = null;

/**
 * Sets up autosave functionality that persists the scene to localStorage
 * whenever it changes, with a debounce delay.
 */
export function setupAutosave(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const unsubscribe = usePlannerStore.subscribe(
    (state) => state.scene,
    (scene) => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }

      autosaveTimeout = setTimeout(() => {
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
 * Returns null if no saved scene exists or if parsing fails.
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
