"use client";

import React, { Suspense } from "react";
import { usePlannerStore } from "../store";
import {
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
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
      // 2D viewer for all drawing/editing modes and unknown modes
      return <Viewer2D width={width} height={height} />;
  }
};

export default Content;
