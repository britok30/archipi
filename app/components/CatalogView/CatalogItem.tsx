"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Armchair, DoorOpen, Minus } from "lucide-react";
import type { CatalogElement } from "../../store/types";

type CatalogItemProps = {
  element: CatalogElement;
  onSelect?: (element: CatalogElement) => void;
  /** Show the prototype badge (useful in mixed search results). */
  showType?: boolean;
  className?: string;
  disabled?: boolean;
};

const PROTOTYPE_LABEL: Record<string, string> = {
  lines: "Wall",
  holes: "Opening",
  items: "Item",
};

/** Catalog data uses lowercase names ("bar stool") — title-case for display. */
const titleCase = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const FallbackIcon = ({ prototype }: { prototype: string }) => {
  const Icon =
    prototype === "lines" ? Minus : prototype === "holes" ? DoorOpen : Armchair;
  return <Icon className="size-8 text-zinc-400" strokeWidth={1.5} />;
};

const CatalogItem = ({
  element,
  onSelect,
  showType = false,
  className = "",
  disabled = false,
}: CatalogItemProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const image = element.info?.image;
  const title = element.info?.title || element.name;

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
    <div
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      aria-label={`Add ${title}`}
      title={element.info?.description || title}
      className={`
        group relative flex flex-col overflow-hidden rounded-lg border border-border/60
        bg-card text-left outline-none transition-all duration-150
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-primary/50 hover:shadow-[0_0_0_1px_hsl(217_91%_60%/0.35),0_8px_24px_-12px_rgb(0_0_0/0.6)] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        }
        ${className}
      `}
    >
      {/* Thumbnail — light neutral ground so white/transparent PNGs read.
          Capped at 96 CSS px so the ~200px sources stay crisp on 2x displays;
          `unoptimized` serves the tiny (~3KB) originals byte-for-byte instead
          of recompressing them. */}
      <div className="relative h-24 w-full bg-[#EEEFF1] flex items-center justify-center">
        {image && !imageFailed ? (
          <Image
            className={`object-contain object-center p-1.5 ${
              !disabled ? "transition-transform duration-200 group-hover:scale-[1.06]" : ""
            }`}
            src={image}
            fill
            unoptimized
            priority={false}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <FallbackIcon prototype={element.prototype} />
        )}

        {showType && (
          <Badge
            variant="secondary"
            className="absolute right-1.5 top-1.5 px-1.5 py-0 text-[10px] font-medium"
          >
            {PROTOTYPE_LABEL[element.prototype] ?? element.prototype}
          </Badge>
        )}
      </div>

      {/* Single title line */}
      <div className="px-1.5 py-1">
        <p className="truncate text-[11px] font-medium text-foreground">
          {titleCase(title)}
        </p>
      </div>
    </div>
  );
};

export default CatalogItem;
