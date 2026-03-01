"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { ReactPlannerUtils } from "../../utils";
import { Camera } from "lucide-react";
import ToolbarButton from "./ToolbarButton";
import {
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_3D_FIRST_PERSON,
  MODE_3D_VIEW,
} from "../../store/types";

const { imageBrowserDownload } = ReactPlannerUtils.BrowserUtils;
const { saveSVGtoPngFile } = ReactPlannerUtils.ImageUtils;

export default function ScreenshotToolbarButton() {
  const { translator } = useCatalogContext();
  const mode = usePlannerStore((state) => state.mode);

  const saveScreenshotToFile = (event: React.MouseEvent) => {
    event.preventDefault();
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const imageData = canvas.toDataURL();
      imageBrowserDownload(imageData);
    } else {
      console.error("Canvas element not found.");
    }
  };

  const saveSVGScreenshotToFile = (event: React.MouseEvent) => {
    event.preventDefault();
    const svgElements = Array.from(document.querySelectorAll("svg"));

    if (svgElements.length > 0) {
      const largestSVG = svgElements.reduce((largest, current) =>
        current.width.baseVal.value > largest.width.baseVal.value
          ? current
          : largest
      );
      saveSVGtoPngFile(largestSVG);
    } else {
      console.error("SVG elements not found.");
    }
  };

  const is3DMode = [MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode);
  const is2DMode = [
    MODE_IDLE,
    MODE_2D_ZOOM_IN,
    MODE_2D_ZOOM_OUT,
    MODE_2D_PAN,
    MODE_WAITING_DRAWING_LINE,
    MODE_DRAGGING_LINE,
    MODE_DRAGGING_VERTEX,
    MODE_DRAGGING_ITEM,
    MODE_DRAWING_LINE,
    MODE_DRAWING_HOLE,
    MODE_DRAWING_ITEM,
    MODE_DRAGGING_HOLE,
    MODE_ROTATING_ITEM,
  ].includes(mode);

  const tooltip = translator?.t("Get Screenshot") || "Get Screenshot";

  if (is3DMode) {
    return (
      <ToolbarButton
        active={false}
        tooltip={tooltip}
        onClick={saveScreenshotToFile}
      >
        <Camera size={23} />
        Snap
      </ToolbarButton>
    );
  }

  if (is2DMode) {
    return (
      <ToolbarButton
        active={false}
        tooltip={tooltip}
        onClick={saveSVGScreenshotToFile}
      >
        <Camera size={23} />
        Snap
      </ToolbarButton>
    );
  }

  return null;
}
