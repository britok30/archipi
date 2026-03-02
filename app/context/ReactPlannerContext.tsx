"use client";

import { createContext, useContext, ReactNode } from "react";
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
  return (
    <ReactPlannerContext.Provider value={{ catalog: catalog ?? null }}>
      {children}
    </ReactPlannerContext.Provider>
  );
}

export function useCatalogContext() {
  return useContext(ReactPlannerContext);
}

export default ReactPlannerContext;
