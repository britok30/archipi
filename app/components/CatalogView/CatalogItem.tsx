"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ElementInfo = {
  title: string;
  description: string;
  image: string;
  tag: string[];
  visibility?: {
    catalog: boolean;
  };
};

type ElementPrototype = "lines" | "items" | "holes";

export type CatalogElement = {
  name: string;
  prototype: ElementPrototype;
  info: ElementInfo;
};

type CatalogItemProps = {
  element: CatalogElement;
  onSelect?: (element: CatalogElement) => void;
  className?: string;
  disabled?: boolean;
};

const CatalogItem = ({
  element,
  onSelect,
  className = "",
  disabled = false,
}: CatalogItemProps) => {
  const handleSelect = () => {
    if (!disabled && onSelect) {
      onSelect(element);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={`
        group relative
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-lg"
        }
        transition-all duration-200
        ${className}
      `}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
    >
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">
          {element.info.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
          <Image
            className={`
              object-contain object-center
              ${!disabled && "group-hover:scale-105"}
              transition-transform duration-200
            `}
            src={element.info.image}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            alt={`Preview of ${element.info.title}`}
          />
        </div>

        {/* Tags */}
        {element.info.tag.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {element.info.tag.map((tag) => (
              <Badge
                key={`${element.name}-${tag}`}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {element.info.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {element.info.description}
          </p>
        )}

        {/* Element Type Indicator */}
        <Badge
          variant="outline"
          className="absolute top-2 right-2 text-xs capitalize"
        >
          {element.prototype}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default CatalogItem