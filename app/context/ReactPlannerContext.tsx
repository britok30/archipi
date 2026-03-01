"use client";

import { createContext, useContext, ReactNode } from "react";
import type { RuntimeCatalog } from "../store/types";

// Simple context for catalog and translator only
// All state management is now done via Zustand usePlannerStore

interface PlannerContextType {
  catalog: RuntimeCatalog | null;
  translator: {
    t: (phrase: string, ...params: (string | number)[]) => string;
  } | null;
}

const ReactPlannerContext = createContext<PlannerContextType>({
  catalog: null,
  translator: null,
});

interface PlannerProviderProps {
  children: ReactNode;
  catalog?: RuntimeCatalog;
  translator?: { t: (phrase: string, ...params: (string | number)[]) => string };
}

export function PlannerProvider({ children, catalog, translator }: PlannerProviderProps) {
  return (
    <ReactPlannerContext.Provider value={{ catalog: catalog ?? null, translator: translator ?? null }}>
      {children}
    </ReactPlannerContext.Provider>
  );
}

export function useCatalogContext() {
  return useContext(ReactPlannerContext);
}

export default ReactPlannerContext;
