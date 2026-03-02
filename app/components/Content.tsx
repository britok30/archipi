"use client";

import React, { Suspense } from "react";
import { usePlannerStore } from "../store";
import {
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from "../store/types";
import { Viewer2D } from "./Viewer2D/Viewer2d";
import CatalogList from "./CatalogView/CatalogList";
import ProjectConfigurator from "./ProjectConfigurator";
import Viewer3D from "./Viewer3D/Viewer3d";

interface ContentProps {
  width: number;
  height: number;
}

const VIEWER_2D_MODES = new Set([
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
]);

const Content: React.FC<ContentProps> = ({ width, height }) => {
  const mode = usePlannerStore((state) => state.mode);

  switch (mode) {
    case MODE_3D_VIEW:
    case MODE_3D_FIRST_PERSON:
      return (
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full">Loading 3D...</div>}>
          <Viewer3D width={width} height={height} />
        </Suspense>
      );

    case MODE_VIEWING_CATALOG:
      return <CatalogList />;

    case MODE_CONFIGURING_PROJECT:
      return <ProjectConfigurator />;

    default:
      if (VIEWER_2D_MODES.has(mode)) {
        return <Viewer2D width={width} height={height} />;
      }
      // Fallback to 2D viewer for unknown modes
      return <Viewer2D width={width} height={height} />;
  }
};

export default Content;
