"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import type { SnapMask } from "../../store/types";
import {
  MODE_3D_FIRST_PERSON,
  MODE_3D_VIEW,
} from "../../store/types";

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
      className="fixed bottom-0 z-50 flex items-center bg-zinc-900/95 backdrop-blur-xs text-[11px] text-zinc-400 select-none border-t border-zinc-800"
      style={{ width, height }}
    >
      {/* Coordinates */}
      {!is3D && (
        <div className="flex items-center gap-3 px-3 border-r border-zinc-800 h-full tabular-nums">
          <span>
            X <span className="text-zinc-200">{mouse.x.toFixed(0)}</span>
          </span>
          <span>
            Y <span className="text-zinc-200">{mouse.y.toFixed(0)}</span>
          </span>
          <span className="text-zinc-500">{unit}</span>
        </div>
      )}

      {/* Zoom */}
      <div className="px-3 border-r border-zinc-800 h-full flex items-center tabular-nums">
        <span className="text-zinc-200">{zoomPct}%</span>
      </div>

      {/* Mode indicator */}
      {is3D && (
        <div className="px-3 border-r border-zinc-800 h-full flex items-center">
          <span className="text-zinc-200">
            {mode === MODE_3D_FIRST_PERSON ? "First Person" : "3D View"}
          </span>
        </div>
      )}

      {/* Snap toggles */}
      {!is3D && (
        <div className="flex items-center gap-0.5 px-2 border-r border-zinc-800 h-full">
          {SNAP_BUTTONS.map(({ key, label }) => {
            const on = snapMask[key];
            return (
              <button
                key={key}
                onClick={() => toggleSnap(key)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  on
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
                title={`Snap to ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Signature */}
      {softwareSignature && (
        <div className="ml-auto px-3 text-zinc-500">{softwareSignature}</div>
      )}
    </footer>
  );
};

export default Footer;
