"use client";

import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface PanelProps {
  name: string;
  value: string;
  icon?: React.ReactNode;
  headComponents?: React.ReactNode;
  children?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({
  name,
  value,
  icon,
  headComponents,
  children,
}) => {
  return (
    <AccordionItem value={value} className="border-b border-border/40">
      <AccordionTrigger className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline hover:text-foreground data-[state=open]:text-primary">
        <span className="flex items-center gap-2">
          {icon}
          {name}
        </span>
        {headComponents}
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3 text-xs">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default Panel;
