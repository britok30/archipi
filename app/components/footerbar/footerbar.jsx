"use client";

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import If from "../../utils/react-if";
import FooterToggleButton from "./footer-toggle-button";
import FooterContentButton from "./footer-content-button";
import {
  SNAP_POINT,
  SNAP_LINE,
  SNAP_SEGMENT,
  SNAP_GRID,
  SNAP_GUIDE,
} from "../../utils/snap";
import { MODE_SNAPPING } from "../../utils/constants";
import * as SharedStyle from "../../styles/shared-style";
import { MdAddCircle, MdWarning } from "react-icons/md";

const appMessageStyle = { borderBottom: "1px solid #555", lineHeight: "1.5em" };

const FooterBar = ({
  state: globalState,
  width,
  height,
  footerbarComponents,
  softwareSignature,
}) => {
  const [state] = useState({});
  const { translator, projectActions } = useContext(ReactPlannerContext);
  const { x, y } = globalState.get("mouse").toJS();
  const zoom = globalState.get("zoom");
  const mode = globalState.get("mode");

  let updateSnapMask = (val) =>
    projectActions.toggleSnap(globalState.snapMask.merge(val));

  return (
    <div
      className="fixed bottom-0 leading-[14px] text-xs bg-[#292929] text-white py-1 px-2 m-0 box-border cursor-default select-none z-[9001]"
      style={{ width, height }}
    >
      {MODE_SNAPPING.includes(mode) && (
        <>
          <div className="relative border-r border-white float-left py-0 px-[1rem] inline-block">
            <div
              className="inline-block w-[6rem] m-0 p-0"
              title={translator.t("Mouse X Coordinate")}
            >
              X : {x.toFixed(3)}
            </div>
            <div
              className="inline-block w-[6rem] m-0 p-0"
              title={translator.t("Mouse Y Coordinate")}
            >
              Y : {y.toFixed(3)}
            </div>
          </div>

          <div
            className="relative border-r border-white float-left py-0 px-[1rem] inline-block"
            title={translator.t("Scene Zoom Level")}
          >
            Zoom: {zoom.toFixed(3)}X
          </div>

          <div className="relative border-r border-white float-left py-0 px-[1rem] inline-block">
            <FooterToggleButton
              state={state}
              toggleOn={() => {
                updateSnapMask({ SNAP_POINT: true });
              }}
              toggleOff={() => {
                updateSnapMask({ SNAP_POINT: false });
              }}
              text="Snap PT"
              toggleState={globalState.snapMask.get(SNAP_POINT)}
              title={translator.t("Snap to Point")}
            />
            <FooterToggleButton
              state={state}
              toggleOn={() => {
                updateSnapMask({ SNAP_LINE: true });
              }}
              toggleOff={() => {
                updateSnapMask({ SNAP_LINE: false });
              }}
              text="Snap LN"
              toggleState={globalState.snapMask.get(SNAP_LINE)}
              title={translator.t("Snap to Line")}
            />
            <FooterToggleButton
              state={state}
              toggleOn={() => {
                updateSnapMask({ SNAP_SEGMENT: true });
              }}
              toggleOff={() => {
                updateSnapMask({ SNAP_SEGMENT: false });
              }}
              text="Snap SEG"
              toggleState={globalState.snapMask.get(SNAP_SEGMENT)}
              title={translator.t("Snap to Segment")}
            />
            <FooterToggleButton
              state={state}
              toggleOn={() => {
                updateSnapMask({ SNAP_GRID: true });
              }}
              toggleOff={() => {
                updateSnapMask({ SNAP_GRID: false });
              }}
              text="Snap GRD"
              toggleState={globalState.snapMask.get(SNAP_GRID)}
              title={translator.t("Snap to Grid")}
            />
            <FooterToggleButton
              state={state}
              toggleOn={() => {
                updateSnapMask({ SNAP_GUIDE: true });
              }}
              toggleOff={() => {
                updateSnapMask({ SNAP_GUIDE: false });
              }}
              text="Snap GDE"
              toggleState={globalState.snapMask.get(SNAP_GUIDE)}
              title={translator.t("Snap to Guide")}
            />
          </div>
        </>
      )}

      {footerbarComponents.map((Component, index) => (
        <Component state={state} key={index} />
      ))}

      {softwareSignature && (
        <div className="relative border-l border-white  float-right py-0 px-[1rem] inline-block">
          {softwareSignature}
        </div>
      )}
    </div>
  );
};

FooterBar.propTypes = {
  state: PropTypes.object.isRequired,
  footerbarComponents: PropTypes.array.isRequired,
  softwareSignature: PropTypes.string,
};

export default FooterBar;
