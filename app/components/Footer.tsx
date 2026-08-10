"use client";

import React from "react";
import { usePlannerStore } from "../store";
import type { SnapMask } from "../store/types";
import { MODE_3D_FIRST_PERSON, MODE_3D_VIEW } from "../store/types";

const SNAP_BUTTONS: Array<{ key: keyof SnapMask; label: string }> = [
  { key: "SNAP_POINT", label: "Point" },
  { key: "SNAP_LINE", label: "Line" },
  { key: "SNAP_SEGMENT", label: "Segment" },
  { key: "SNAP_GRID", label: "Grid" },
  { key: "SNAP_GUIDE", label: "Guide" },
];

interface FooterProps {
  width: number;
  height: number;
  softwareSignature?: string;
}

const Footer: React.FC<FooterProps> = ({ width, height, softwareSignature }) => {
  const mouse = usePlannerStore((state) => state.mouse);
  const zoom = usePlannerStore((state) => state.zoom);
  const mode = usePlannerStore((state) => state.mode);
  const snapMask = usePlannerStore((state) => state.snapMask);
  const toggleSnap = usePlannerStore((state) => state.toggleSnap);
  const unit = usePlannerStore((state) => state.scene.unit);

  const is3D = mode === MODE_3D_FIRST_PERSON || mode === MODE_3D_VIEW;
  const zoomPct = Math.round((zoom || 1) * 100);

  return (
    <footer
      className="fixed bottom-0 z-50 flex items-center bg-background/95 backdrop-blur-xs text-[11px] text-muted-foreground select-none border-t border-border"
      style={{ width, height }}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-1.5 px-3 border-r border-border h-full">
        <span
          aria-hidden
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-primary text-[9px] font-bold leading-none text-primary-foreground"
        >
          A
        </span>
        <span className="font-semibold tracking-wide text-foreground/90">
          {softwareSignature || "ArchiPi"}
        </span>
      </div>

      {/* Coordinates */}
      {!is3D && (
        <div className="flex items-center gap-3 px-3 border-r border-border h-full tabular-nums">
          <span>
            X <span className="text-foreground">{mouse.x.toFixed(0)}</span>
          </span>
          <span>
            Y <span className="text-foreground">{mouse.y.toFixed(0)}</span>
          </span>
          <span className="text-muted-foreground/70">{unit}</span>
        </div>
      )}

      {/* Zoom */}
      <div
        className="px-3 border-r border-border h-full flex items-center tabular-nums"
        title="Zoom level"
      >
        <span className="text-foreground">{zoomPct}%</span>
      </div>

      {/* Mode indicator */}
      {is3D && (
        <div className="px-3 border-r border-border h-full flex items-center">
          <span className="text-foreground">
            {mode === MODE_3D_FIRST_PERSON ? "First Person" : "3D View"}
          </span>
        </div>
      )}

      {/* Snap toggles — not wired to drawing yet; kept subdued on purpose */}
      {!is3D && (
        <div
          className="flex items-center gap-0.5 px-2 border-r border-border h-full opacity-50"
          aria-label="Snapping options (coming soon)"
        >
          <span className="pr-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
            Snap
          </span>
          {SNAP_BUTTONS.map(({ key, label }) => {
            const on = snapMask[key];
            return (
              <button
                key={key}
                onClick={() => toggleSnap(key)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  on
                    ? "bg-primary/15 text-primary/90"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
                title={`Snap to ${label} (coming soon)`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Credits */}
      <div className="ml-auto flex items-center gap-2 px-3 text-muted-foreground/80 whitespace-nowrap">
        <span className="hidden lg:inline">
          From the makers of{" "}
          <a
            href="https://www.architectgpt.io"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ArchitectGPT
          </a>
        </span>
        <span className="hidden lg:inline text-border">·</span>
        <span className="hidden lg:inline">
          Built on{" "}
          <a
            href="https://github.com/cvdlab/react-planner"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            react-planner
          </a>{" "}
          by CVDLAB
        </span>
      </div>
    </footer>
  );
};

export default Footer;
