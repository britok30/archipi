"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlannerStore } from "../../store";
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
  const goBackToCatalogPage = usePlannerStore((state) => state.goBackToCatalogPage);

  return (
    <Card className="cursor-pointer" onClick={() => goBackToCatalogPage()}>
      <CardContent className="flex items-center justify-center h-full">
        <ArrowLeft size={50} />
      </CardContent>
    </Card>
  );
};

export default CatalogTurnBackPageItem;
