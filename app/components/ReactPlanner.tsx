"use client";

import React, { useEffect } from "react";
import { usePlannerStore } from "../store";
import { PlannerProvider } from "../context/ReactPlannerContext";
import Footer from "./Footer";
import Sidebar from "./Sidebar/Sidebar";
import Content from "./Content";
import Toolbar from "./Toolbar/Toolbar";
import type { RuntimeCatalog } from "../store/types";

const FOOTER_HEIGHT = 25;
const TOOLBAR_GUTTER = 72;

interface ReactPlannerProps {
  width: number;
  height: number;
  catalog?: RuntimeCatalog;
  plugins?: Array<(state: unknown) => unknown>;
  toolbarButtons?: React.ReactNode[];
  softwareSignature?: string;
}

function ReactPlanner({
  width,
  height,
  catalog,
  plugins = [],
  toolbarButtons = [],
  softwareSignature = "ArchiPi",
}: ReactPlannerProps) {
  const catalogReady = usePlannerStore((state) => state.catalog.ready);
  const initCatalog = usePlannerStore((state) => state.initCatalog);

  // Initialize catalog on mount
  useEffect(() => {
    if (!catalogReady && catalog) {
      initCatalog(catalog);
    }
  }, [catalog, catalogReady, initCatalog]);

  const contentHeight = height - FOOTER_HEIGHT;

  return (
    <PlannerProvider catalog={catalog}>
      <div className="flex flex-row flex-nowrap w-full h-full">
        <Toolbar toolbarButtons={toolbarButtons} />
        <div style={{ paddingLeft: TOOLBAR_GUTTER }} className="flex-1 min-w-0">
          <Content width={width - TOOLBAR_GUTTER} height={contentHeight} />
        </div>
        <Sidebar />
        <Footer
          width={width}
          height={FOOTER_HEIGHT}
          softwareSignature={softwareSignature}
        />
      </div>
    </PlannerProvider>
  );
}

export default ReactPlanner;
