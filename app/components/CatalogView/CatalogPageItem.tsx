"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { Folder } from "lucide-react";

interface Page {
  name: string;
  label: string;
}

interface CatalogPageItemProps {
  page: Page;
  oldPage: Page;
}

const CatalogPageItem: React.FC<CatalogPageItemProps> = ({ page, oldPage }) => {
  const changeCatalogPage = usePlannerStore((state) => state.changeCatalogPage);

  const open = () => changeCatalogPage(page.name, oldPage.name);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${page.label} category`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card cursor-pointer outline-none transition-all duration-150 hover:border-primary/50 hover:shadow-[0_0_0_1px_hsl(217_91%_60%/0.35),0_8px_24px_-12px_rgb(0_0_0/0.6)] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
    >
      <div className="relative h-24 w-full flex items-center justify-center bg-muted/40">
        <Folder
          className="size-8 text-primary/70 transition-transform duration-200 group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div>
      <div className="px-1.5 py-1">
        <p className="truncate text-[11px] font-medium text-foreground">
          {page.label}
        </p>
      </div>
    </div>
  );
};

export default CatalogPageItem;
