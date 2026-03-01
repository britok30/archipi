"use client";

import { useEffect, ReactNode } from "react";
import {
  usePlannerStore,
  setupAutosave,
  setupKeyboardShortcuts,
  loadSavedScene,
} from "../store";

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Load saved scene from localStorage
    const savedScene = loadSavedScene();
    if (savedScene) {
      usePlannerStore.getState().loadProject(savedScene);
    }

    // Setup autosave
    const cleanupAutosave = setupAutosave();

    // Setup keyboard shortcuts
    const cleanupKeyboard = setupKeyboardShortcuts();

    // Cleanup on unmount
    return () => {
      cleanupAutosave();
      cleanupKeyboard();
    };
  }, []);

  return <>{children}</>;
}

export default Providers;
