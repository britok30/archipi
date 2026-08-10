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
  /** Muted, non-uppercase annotation after the name (e.g. "37.44 m²"). */
  subtitle?: string;
  /** Full/raw identifier surfaced on hover for power users. */
  titleAttr?: string;
  headComponents?: React.ReactNode;
  children?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({
  name,
  value,
  icon,
  subtitle,
  titleAttr,
  headComponents,
  children,
}) => {
  return (
    <AccordionItem value={value} className="border-b border-border/40">
      <AccordionTrigger
        title={titleAttr}
        className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline hover:text-foreground data-[state=open]:text-primary"
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="truncate">{name}</span>
          {subtitle && (
            <span className="normal-case font-normal tracking-normal text-[11px] text-muted-foreground/80 shrink-0">
              {subtitle}
            </span>
          )}
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
