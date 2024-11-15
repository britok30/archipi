"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../context/ReactPlannerContext";
import { ReactPlannerConstants } from "../utils";
import { ReactPlannerUtils } from "../utils";
import { IoCamera } from "react-icons/io5";
import ToolbarButton from "../components/Toolbar/ToolbarButton";

const { imageBrowserDownload } = ReactPlannerUtils.BrowserUtils;
const { saveSVGtoPngFile } = ReactPlannerUtils.ImageUtils;

const {
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
} = ReactPlannerConstants;

export default function ScreenshotToolbarButton({ mode }) {
  let { translator } = useContext(ReactPlannerContext);

  let saveScreenshotToFile = (event) => {
    event.preventDefault();
    let canvas = document.getElementsByTagName("canvas")[0];
    imageBrowserDownload(canvas.toDataURL());
  };

  let saveSVGScreenshotToFile = (event) => {
    event.preventDefault();

    // First of all I need the svg content of the viewer
    let svgElements = document.getElementsByTagName("svg");

    // I get the element with max width (which is the viewer)
    let maxWidthSVGElement = svgElements[0];
    for (let i = 1; i < svgElements.length; i++) {
      if (
        svgElements[i].width.baseVal.value >
        maxWidthSVGElement.width.baseVal.value
      ) {
        maxWidthSVGElement = svgElements[i];
      }
    }

    saveSVGtoPngFile(maxWidthSVGElement);
  };

  if ([MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode)) {
    return (
      <ToolbarButton
        active={false}
        tooltip={translator.t("Get Screenshot")}
        onClick={saveScreenshotToFile}
      >
        <IoCamera className="mb-0.5" size={23} />
        Snap
      </ToolbarButton>
    );
  }

  if (
    [
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
    ].includes(mode)
  ) {
    return (
      <ToolbarButton
        active={false}
        tooltip={translator.t("Get Screenshot")}
        onClick={saveSVGScreenshotToFile}
      >
        <IoCamera className="mb-0.5" size={23} />
        Snap
      </ToolbarButton>
    );
  }

  return null;
}

ScreenshotToolbarButton.propTypes = {
  mode: PropTypes.string.isRequired,
};
