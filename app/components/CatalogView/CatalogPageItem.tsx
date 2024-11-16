"use client";

import React, { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactPlannerContext from "../../context/ReactPlannerContext";

interface Page {
  name: string;
  label: string;
}

interface CatalogPageItemProps {
  page: Page;
  oldPage: Page;
}

const CatalogPageItem: React.FC<CatalogPageItemProps> = ({ page, oldPage }) => {
  const { projectActions } = useContext<any>(ReactPlannerContext);

  const changePage = (newPage: string) => {
    projectActions.changeCatalogPage(newPage, oldPage.name);
  };

  return (
    <Card className="cursor-pointer" onClick={() => changePage(page.name)}>
      <CardContent className="flex items-center justify-center h-full">
        <h3 className="text-2xl">{page.label}</h3>
      </CardContent>
    </Card>
  );
};

export default CatalogPageItem;
