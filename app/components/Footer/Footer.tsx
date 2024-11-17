"use client";

import React from "react";
import { Map as ImmutableMap } from "immutable";
import { useContext } from "react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import FooterToggleButton from "./FooterToggleButton";
import {
  SNAP_POINT,
  SNAP_LINE,
  SNAP_SEGMENT,
  SNAP_GRID,
  SNAP_GUIDE,
} from "../../utils/snap";
import { MODE_SNAPPING } from "../../utils/constants";

// Define strict types for the snap mask values
type SnapMaskKey =
  | typeof SNAP_POINT
  | typeof SNAP_LINE
  | typeof SNAP_SEGMENT
  | typeof SNAP_GRID
  | typeof SNAP_GUIDE;
type SnapMask = Record<SnapMaskKey, boolean>;

interface MousePosition {
  x: number;
  y: number;
}

interface FooterProps {
  state: ImmutableMap<string, any>;
  width: number;
  height: number;
  footerbarComponents: React.ReactNode[];
  softwareSignature?: string;
}

const Footer: React.FC<FooterProps> = ({
  state: globalState,
  width,
  height,
  softwareSignature,
}) => {
  const { translator, projectActions } = useContext(ReactPlannerContext);

  // Extract and type mouse position
  const mouse = globalState.get("mouse");
  const { x, y }: MousePosition = mouse?.toJS() ?? { x: 0, y: 0 };

  const zoom = globalState.get("zoom") ?? 1;
  const mode = globalState.get("mode");

  const updateSnapMask = (val: Partial<SnapMask>) => {
    const snapMask = globalState.get("snapMask") as ImmutableMap<
      SnapMaskKey,
      boolean
    >;
    const newSnapMask = snapMask ? snapMask.merge(val) : ImmutableMap(val);
    projectActions.toggleSnap(newSnapMask);
  };

  // Snap button configurations for cleaner rendering
  const snapButtons = [
    { key: SNAP_POINT, text: "Snap PT", title: "Snap to Point" },
    { key: SNAP_LINE, text: "Snap LN", title: "Snap to Line" },
    { key: SNAP_SEGMENT, text: "Snap SEG", title: "Snap to Segment" },
    { key: SNAP_GRID, text: "Snap GRD", title: "Snap to Grid" },
    { key: SNAP_GUIDE, text: "Snap GDE", title: "Snap to Guide" },
  ];

  return (
    <footer
      className="
        fixed bottom-0 z-50
        w-full h-10
        bg-gray-900 text-gray-100
        flex items-center
        text-xs
        shadow-lg
        select-none
      "
      style={{ width, height }}
    >
      {MODE_SNAPPING.includes(mode) && (
        <>
          {/* Coordinates Section */}
          <div className="flex items-center px-4 border-r border-gray-700 w-[200px]">
            <div className="space-x-4">
              <span title={translator.t("Mouse X Coordinate")}>
                X: {x.toFixed(3)}
              </span>
              <span title={translator.t("Mouse Y Coordinate")}>
                Y: {y.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Zoom Section */}
          <div
            className="px-4 border-r border-gray-700 w-[150px]"
            title={translator.t("Scene Zoom Level")}
          >
            Zoom: {zoom.toFixed(3)}X
          </div>

          {/* Snap Controls */}
          <div className="flex items-center px-4 space-x-2 border-r border-gray-700">
            {snapButtons.map(({ key, text, title }) => (
              <FooterToggleButton
                key={key}
                toggleOn={() => updateSnapMask({ [key]: true })}
                toggleOff={() => updateSnapMask({ [key]: false })}
                text={text}
                toggleState={globalState.getIn(["snapMask", key], false)}
                title={translator.t(title)}
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
