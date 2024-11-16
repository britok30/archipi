"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Badge } from "@/components/ui/badge";

interface CatalogElementInfo {
  title: string;
  image: string;
  tag: string[];
  description: string;
}

interface CatalogElement {
  prototype: "lines" | "items" | "holes";
  name: string;
  info: CatalogElementInfo;
}

interface CatalogItemProps {
  element: CatalogElement;
}

const CatalogItem: React.FC<CatalogItemProps> = ({ element }) => {
  const { linesActions, itemsActions, holesActions, projectActions } =
    useContext(ReactPlannerContext);

  const select = () => {
    switch (element.prototype) {
      case "lines":
        linesActions.selectToolDrawingLine(element.name);
        break;
      case "items":
        itemsActions.selectToolDrawingItem(element.name);
        break;
      case "holes":
        holesActions.selectToolDrawingHole(element.name);
        break;
      default:
        break;
    }

    projectActions.pushLastSelectedCatalogElementToHistory(element);
  };

  return (
    <Card className="cursor-pointer" onClick={select}>
      <CardHeader>
        <CardTitle>{element.info.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Image */}
        <div className="w-full h-32 relative overflow-hidden mb-4">
          <Image
            className="object-contain object-center"
            src={element.info.image}
            fill
            alt={`catalog_item_${element.info.title}`}
          />
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 items-center mb-2">
          {element.info.tag.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        {/* Description */}
        <p className="text-xs text-black font-semibold">
          {element.info.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default CatalogItem;
