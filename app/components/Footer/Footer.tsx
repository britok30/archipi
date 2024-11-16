"use client";

import React, { useContext } from "react";
import { Map as ImmutableMap } from "immutable";
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

interface FooterProps {
  state: ImmutableMap<string, any>;
  width: number;
  height: number;
  footerbarComponents: any[];
  softwareSignature?: string;
}

interface ToggleSnapAction {
  // Define the properties of ToggleSnapAction if needed
}

interface ProjectActions {
  toggleSnap: (snapMask: ImmutableMap<string, boolean>) => ToggleSnapAction;
  // Add other project action methods if needed
}

interface Translator {
  t: (key: string) => string;
}

interface ReactPlannerContextType {
  translator: Translator;
  projectActions: ProjectActions;
}

const Footer: React.FC<FooterProps> = ({
  state: globalState,
  width,
  height,
  footerbarComponents,
  softwareSignature,
}) => {
  const { translator, projectActions } = useContext(ReactPlannerContext);

  const mouse = globalState.get("mouse");
  const { x, y } = mouse ? mouse.toJS() : { x: 0, y: 0 };

  const zoom = globalState.get("zoom") || 1;
  const mode = globalState.get("mode");

  const updateSnapMask = (val: { [key: string]: boolean }) => {
    const snapMask = globalState.get("snapMask") as ImmutableMap<
      string,
      boolean
    >;
    const newSnapMask = snapMask ? snapMask.merge(val) : ImmutableMap(val);
    projectActions.toggleSnap(newSnapMask);
  };

  return (
    <div
      className="fixed bottom-0 leading-[14px] text-xs bg-black text-white py-1 px-2 m-0 box-border cursor-default select-none z-[9001]"
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
              toggleOn={() => {
                updateSnapMask({ [SNAP_POINT]: true });
              }}
              toggleOff={() => {
                updateSnapMask({ [SNAP_POINT]: false });
              }}
              text="Snap PT"
              toggleState={globalState.getIn(["snapMask", SNAP_POINT], false)}
              title={translator.t("Snap to Point")}
            />
            <FooterToggleButton
              toggleOn={() => {
                updateSnapMask({ [SNAP_LINE]: true });
              }}
              toggleOff={() => {
                updateSnapMask({ [SNAP_LINE]: false });
              }}
              text="Snap LN"
              toggleState={globalState.getIn(["snapMask", SNAP_LINE], false)}
              title={translator.t("Snap to Line")}
            />
            <FooterToggleButton
              toggleOn={() => {
                updateSnapMask({ [SNAP_SEGMENT]: true });
              }}
              toggleOff={() => {
                updateSnapMask({ [SNAP_SEGMENT]: false });
              }}
              text="Snap SEG"
              toggleState={globalState.getIn(["snapMask", SNAP_SEGMENT], false)}
              title={translator.t("Snap to Segment")}
            />
            <FooterToggleButton
              toggleOn={() => {
                updateSnapMask({ [SNAP_GRID]: true });
              }}
              toggleOff={() => {
                updateSnapMask({ [SNAP_GRID]: false });
              }}
              text="Snap GRD"
              toggleState={globalState.getIn(["snapMask", SNAP_GRID], false)}
              title={translator.t("Snap to Grid")}
            />
            <FooterToggleButton
              toggleOn={() => {
                updateSnapMask({ [SNAP_GUIDE]: true });
              }}
              toggleOff={() => {
                updateSnapMask({ [SNAP_GUIDE]: false });
              }}
              text="Snap GDE"
              toggleState={globalState.getIn(["snapMask", SNAP_GUIDE], false)}
              title={translator.t("Snap to Guide")}
            />
          </div>
        </>
      )}

      <div className="relative border-l flex space-x-3 border-white float-right py-0 px-[1rem]">
        {softwareSignature && <div>{softwareSignature}</div>}
      </div>
    </div>
  );
};

export default Footer;
