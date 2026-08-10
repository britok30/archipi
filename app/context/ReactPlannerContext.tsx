"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import type { RuntimeCatalog } from "../store/types";

// Simple context for catalog only
// All state management is now done via Zustand usePlannerStore

interface PlannerContextType {
  catalog: RuntimeCatalog | null;
}

const ReactPlannerContext = createContext<PlannerContextType>({
  catalog: null,
});

interface PlannerProviderProps {
  children: ReactNode;
  catalog?: RuntimeCatalog;
}

export function PlannerProvider({ children, catalog }: PlannerProviderProps) {
  // A stable context value is load-bearing: consumers put `catalog` in effect
  // dependency arrays, and a fresh object per render turns rapid store
  // updates (e.g. rotating an item) into an update-depth cascade.
  const value = useMemo(() => ({ catalog: catalog ?? null }), [catalog]);
  return (
    <ReactPlannerContext.Provider value={value}>
      {children}
    </ReactPlannerContext.Provider>
  );
}

export function useCatalogContext() {
  return useContext(ReactPlannerContext);
}

export default ReactPlannerContext;
