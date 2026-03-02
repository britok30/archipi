"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlannerStore } from "../../store";
import { ArrowLeft } from "lucide-react";

const CatalogTurnBackPageItem: React.FC = () => {
  const goBackToCatalogPage = usePlannerStore(
    (state) => state.goBackToCatalogPage
  );

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed"
      onClick={() => goBackToCatalogPage()}
    >
      <CardContent className="flex items-center justify-center gap-2 h-full min-h-[120px]">
        <ArrowLeft className="size-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Back</span>
      </CardContent>
    </Card>
  );
};

export default CatalogTurnBackPageItem;
