"use client";

import React, { ReactNode } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  active: boolean;
  tooltip: string;
  children: ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  active,
  tooltip,
  children,
  onClick,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`
              relative flex items-center justify-center w-10 h-10 rounded-lg
              transition-all duration-200 ease-out
              ${
                active
                  ? "bg-[hsl(217_91%_60%/0.15)] text-primary after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-[3px] after:h-5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:bg-[hsl(217_91%_60%/0.08)] hover:text-foreground"
              }
            `}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolbarButton;
