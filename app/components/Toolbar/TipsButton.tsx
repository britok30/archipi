"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ToolbarButton from "./ToolbarButton";
import { usePlannerStore } from "../../store";
import { MODE_3D_FIRST_PERSON, MODE_3D_VIEW } from "../../store/types";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded bg-muted text-[11px] font-mono font-medium text-muted-foreground border border-border/50">
      {children}
    </kbd>
  );
}

function Row({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex items-center gap-0.5 shrink-0">
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-muted-foreground/40 text-[10px]">+</span>
            )}
            <Kbd>{k}</Kbd>
          </React.Fragment>
        ))}
      </span>
      <span className="text-xs text-muted-foreground">{action}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

const TipsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mode = usePlannerStore((state) => state.mode);
  const is3D = mode === MODE_3D_FIRST_PERSON || mode === MODE_3D_VIEW;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <ToolbarButton
            tooltip="Navigation Tips"
            active={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            <HelpCircle size={20} />
          </ToolbarButton>
        </div>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-60 p-3 space-y-3">
        <h3 className="text-sm font-semibold">
          {is3D ? "3D Controls" : "2D Controls"}
        </h3>

        {is3D ? (
          <Section title="Mouse">
            <Row keys={["Left Drag"]} action="Orbit" />
            <Row keys={["Right Drag"]} action="Pan" />
            <Row keys={["Scroll"]} action="Zoom" />
          </Section>
        ) : (
          <Section title="Mouse">
            <Row keys={["Scroll"]} action="Zoom" />
            <Row keys={["Click"]} action="Select" />
            <Row keys={["Click", "Drag"]} action="Pan" />
          </Section>
        )}

        <div className="border-t border-border/40" />

        <Section title="Shortcuts">
          <Row keys={[mod, "Z"]} action="Undo" />
          <Row keys={[mod, isMac ? "⇧Z" : "Y"]} action="Redo" />
          <Row keys={["Del"]} action="Delete selected" />
          <Row keys={["Esc"]} action="Cancel / Deselect" />
          <Row keys={[mod, "C"]} action="Copy properties" />
          <Row keys={[mod, "V"]} action="Paste properties" />
        </Section>
      </PopoverContent>
    </Popover>
  );
};

export default TipsButton;
