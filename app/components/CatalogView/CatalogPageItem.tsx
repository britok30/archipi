"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlannerStore } from "../../store";
import { FolderOpen } from "lucide-react";

interface Page {
  name: string;
  label: string;
}

interface CatalogPageItemProps {
  page: Page;
  oldPage: Page;
}

const CatalogPageItem: React.FC<CatalogPageItemProps> = ({
  page,
  oldPage,
}) => {
  const changeCatalogPage = usePlannerStore(
    (state) => state.changeCatalogPage
  );

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => changeCatalogPage(page.name, oldPage.name)}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 h-full min-h-[120px]">
        <FolderOpen className="size-8 text-primary/70" />
        <span className="text-sm font-medium text-center">{page.label}</span>
      </CardContent>
    </Card>
  );
};

export default CatalogPageItem;
