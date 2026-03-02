"use client";

import { useEffect, ReactNode } from "react";
import { Toaster } from "sonner";
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

  // Warn before closing tab if there are unsaved changes
  useEffect(() => {
    const unsubscribe = usePlannerStore.subscribe(
      (state) => state.isDirty,
      (isDirty) => {
        if (isDirty) {
          window.onbeforeunload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
          };
        } else {
          window.onbeforeunload = null;
        }
      },
      { fireImmediately: true }
    );

    return () => {
      unsubscribe();
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default Providers;
