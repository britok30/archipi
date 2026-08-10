"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { ArrowLeft } from "lucide-react";

const CatalogTurnBackPageItem: React.FC = () => {
  const goBackToCatalogPage = usePlannerStore(
    (state) => state.goBackToCatalogPage
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Back to previous category"
      onClick={() => goBackToCatalogPage()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goBackToCatalogPage();
        }
      }}
      className="group flex flex-col overflow-hidden rounded-lg border border-dashed border-border cursor-pointer outline-none transition-all duration-150 hover:border-primary/60 hover:bg-muted/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
    >
      <div className="relative h-24 w-full flex items-center justify-center">
        <ArrowLeft className="size-6 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div className="px-1.5 py-1">
        <p className="truncate text-[11px] font-medium text-muted-foreground">
          Back
        </p>
      </div>
    </div>
  );
};

export default CatalogTurnBackPageItem;
