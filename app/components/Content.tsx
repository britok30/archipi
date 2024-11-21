"use client";

import React from "react";
import { Viewer2D } from "./viewer2d/Viewer2d";
import CatalogList from "./CatalogView/CatalogList";
import ProjectConfigurator from "./ProjectConfigurator/ProjectConfigurator";
import * as constants from "../utils/constants";
import Scene3DViewer from "./viewer3d/Viewer3d";
import Viewer3D from "./viewer3d/Viewer3d";
// import Viewer3DFirstPerson from "./viewer3d/Viewer3DFirstPerson";

interface ContentProps {
  width: number;
  height: number;
  state: any; // Replace `any` with the actual type of `state` if available
  customContents: {
    [key: string]: React.ComponentType<{
      width: number;
      height: number;
      state: any;
    }>;
  };
}

const Content: React.FC<ContentProps> = ({
  width,
  height,
  state,
  customContents,
}) => {
  const mode = state.get("mode");

  // Set of modes that should render the 2D viewer
  const viewer2DModes = new Set([
    constants.MODE_IDLE,
    constants.MODE_2D_ZOOM_IN,
    constants.MODE_2D_ZOOM_OUT,
    constants.MODE_2D_PAN,
    constants.MODE_WAITING_DRAWING_LINE,
    constants.MODE_DRAGGING_LINE,
    constants.MODE_DRAGGING_VERTEX,
    constants.MODE_DRAGGING_ITEM,
    constants.MODE_DRAWING_LINE,
    constants.MODE_DRAWING_HOLE,
    constants.MODE_DRAWING_ITEM,
    constants.MODE_DRAGGING_HOLE,
    constants.MODE_ROTATING_ITEM,
  ]);

  switch (mode) {
    case constants.MODE_3D_VIEW:
      return <Viewer3D state={state} width={width} height={height} />;

    // case constants.MODE_3D_FIRST_PERSON:
    //   return (
    //     <Viewer3DFirstPerson state={state} width={width} height={height} />
    //   );

    case constants.MODE_VIEWING_CATALOG:
      return <CatalogList state={state} />;

    case constants.MODE_CONFIGURING_PROJECT:
      return <ProjectConfigurator state={state} />;

    default:
      if (viewer2DModes.has(mode)) {
        return <Viewer2D state={state} width={width} height={height} />;
      }
      if (customContents.hasOwnProperty(mode)) {
        const CustomContent = customContents[mode];
        return <CustomContent width={width} height={height} state={state} />;
      }
      throw new Error(`Mode ${mode} doesn't have a mapped content`);
  }
};

export default Content;
