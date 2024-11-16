"use client";

import React, { useContext } from "react";
import { MdNavigateBefore } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { ArrowLeft } from "lucide-react";

interface Page {
  name: string;
  label: string;
}

interface CatalogTurnBackPageItemProps {
  page: Page;
}

const CatalogTurnBackPageItem: React.FC<CatalogTurnBackPageItemProps> = ({
  page,
}) => {
  const { projectActions } = useContext(ReactPlannerContext);

  const changePage = (newPage: string) => {
    projectActions.goBackToCatalogPage(newPage);
  };

  return (
    <Card className="cursor-pointer" onClick={() => changePage(page.name)}>
      <CardContent className="flex items-center justify-center h-full">
        <ArrowLeft size={50} />
      </CardContent>
    </Card>
  );
};

export default CatalogTurnBackPageItem;
