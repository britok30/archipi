"use client";

import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  name: string;
  action?: () => void;
};

type BreadcrumbProps = {
  names: BreadcrumbItem[];
};

const CatalogBreadcrumb = ({ names }: BreadcrumbProps) => {
  if (!names.length) return null;

  return (
    <nav aria-label="Breadcrumb navigation">
      <ol className="flex items-center gap-1 text-sm">
        {names.map((item, index) => {
          const isLast = index === names.length - 1;
          const isClickable = !isLast && Boolean(item.action);

          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
              )}
              {isClickable ? (
                <button
                  onClick={item.action}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </button>
              ) : (
                <span
                  className="text-foreground font-medium"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CatalogBreadcrumb;
