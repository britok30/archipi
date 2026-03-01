"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlannerStore } from "../../store";

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

  const handleClick = () => {
    changeCatalogPage(page.name, oldPage.name);
  };

  return (
    <Card className="cursor-pointer" onClick={handleClick}>
      <CardContent className="flex items-center justify-center h-full">
        <h3 className="text-2xl">{page.label}</h3>
      </CardContent>
    </Card>
  );
};

export default CatalogPageItem;
