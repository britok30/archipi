"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import FooterToggleButton from "./FooterToggleButton";
import { MODE_SNAPPING } from "../../utils/constants";
import type { SnapMask } from "../../store/types";

interface FooterProps {
  width: number;
  height: number;
  softwareSignature?: string;
}

const Footer: React.FC<FooterProps> = ({
  width,
  height,
  softwareSignature,
}) => {
  const { translator } = useCatalogContext();

  // Get state from Zustand
  const mouse = usePlannerStore((state) => state.mouse);
  const zoom = usePlannerStore((state) => state.zoom);
  const mode = usePlannerStore((state) => state.mode);
  const snapMask = usePlannerStore((state) => state.snapMask);
  const toggleSnap = usePlannerStore((state) => state.toggleSnap);

  const { x, y } = mouse;

  // Snap button configurations for cleaner rendering
  const snapButtons: Array<{ key: keyof SnapMask; text: string; title: string }> = [
    { key: "SNAP_POINT", text: "Snap PT", title: "Snap to Point" },
    { key: "SNAP_LINE", text: "Snap LN", title: "Snap to Line" },
    { key: "SNAP_SEGMENT", text: "Snap SEG", title: "Snap to Segment" },
    { key: "SNAP_GRID", text: "Snap GRD", title: "Snap to Grid" },
    { key: "SNAP_GUIDE", text: "Snap GDE", title: "Snap to Guide" },
  ];

  const t = (text: string) => translator?.t(text) ?? text;

  return (
    <footer
      className="fixed bottom-0 z-50 w-full h-10 bg-zinc-900 text-gray-100 flex items-center text-xs shadow-lg select-none"
      style={{ width, height }}
    >
      {MODE_SNAPPING.includes(mode) && (
        <>
          {/* Coordinates Section */}
          <div className="flex items-center px-4 border-r border-gray-700 w-[200px]">
            <div className="space-x-4">
              <span title={t("Mouse X Coordinate")}>
                X: {x.toFixed(3)}
              </span>
              <span title={t("Mouse Y Coordinate")}>
                Y: {y.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Zoom Section */}
          <div
            className="px-4 border-r border-gray-700 w-[150px]"
            title={t("Scene Zoom Level")}
          >
            Zoom: {(zoom || 1).toFixed(3)}X
          </div>

          {/* Snap Controls */}
          <div className="flex items-center px-4 space-x-2 border-r border-gray-700">
            {snapButtons.map(({ key, text, title }) => (
              <FooterToggleButton
                key={key}
                toggleOn={() => toggleSnap(key)}
                toggleOff={() => toggleSnap(key)}
                text={text}
                toggleState={snapMask[key]}
                title={t(title)}
              />
            ))}
          </div>
        </>
      )}

      {/* Signature Section */}
      {softwareSignature && (
        <div className="ml-auto px-4 border-l border-gray-700">
          {softwareSignature}
        </div>
      )}
    </footer>
  );
};

export default Footer;
