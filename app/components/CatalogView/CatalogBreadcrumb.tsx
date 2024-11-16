"use client";

import React from "react";
import { MdArrowBack as Arrow } from "react-icons/md";

interface BreadcrumbItem {
  name: string;
  action?: () => void;
}

interface CatalogBreadcrumbProps {
  names: BreadcrumbItem[];
}

const CatalogBreadcrumb: React.FC<CatalogBreadcrumbProps> = ({ names }) => {
  const labelNames = names.map((name, ind) => {
    const lastElement = ind === names.length - 1;

    return (
      <div className="flex" key={ind}>
        <div
          className={`text-lg text-white ${lastElement ? "font-bold" : ""} ${
            name.action ? "cursor-pointer" : ""
          }`}
          onClick={name.action ? () => name.action!() : undefined}
        >
          {name.name}
        </div>
        {!lastElement ? (
          <Arrow className="fill-black text-2xl mx-[10px]" />
        ) : null}
      </div>
    );
  });

  return <div className="m-6 flex">{labelNames}</div>;
};

export default CatalogBreadcrumb;
