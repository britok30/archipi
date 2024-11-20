"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type BreadcrumbItem = {
  name: string;
  action?: () => void;
};

type BreadcrumbProps = {
  names: BreadcrumbItem[];
  className?: string;
};

const BreadcrumbItem = ({
  item,
  isLast,
}: {
  item: BreadcrumbItem;
  isLast: boolean;
}) => {
  const isClickable = Boolean(item.action);

  return (
    <div className="flex items-center">
      <Button
        onClick={item.action}
        disabled={!isClickable}
        className={`
          text-lg text-white
          ${isLast ? "font-bold" : ""}
          ${isClickable ? "hover:opacity-80 cursor-pointer" : "cursor-default"}
          disabled:cursor-text disabled:opacity-100
          transition-opacity
        `}
        aria-current={isLast ? "page" : undefined}
      >
        {item.name}
      </Button>

      {!isLast && (
        <ArrowLeft
          className="text-2xl mx-2.5 fill-black"
          aria-hidden="true"
          role="presentation"
        />
      )}
    </div>
  );
};

const CatalogBreadcrumb = ({ names, className = "" }: BreadcrumbProps) => {
  if (!names.length) return null;

  return (
    <nav aria-label="Breadcrumb navigation" className={`py-6 ${className}`}>
      <ol className="flex flex-wrap gap-1">
        {names.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center">
            <BreadcrumbItem item={item} isLast={index === names.length - 1} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CatalogBreadcrumb;
