"use client";

import React, { useEffect } from "react";
import { usePlannerStore } from "../store";
import { PlannerProvider } from "../context/ReactPlannerContext";
import Footer from "./Footer/Footer";
import Sidebar from "./Sidebar/Sidebar";
import Content from "./Content";
import Toolbar from "./Toolbar/Toolbar";
import type { RuntimeCatalog } from "../store/types";

const FOOTER_HEIGHT = 25;

interface ReactPlannerProps {
  width: number;
  height: number;
  catalog?: RuntimeCatalog;
  translator?: { t: (phrase: string, ...params: (string | number)[]) => string };
  plugins?: Array<(state: unknown) => unknown>;
  toolbarButtons?: React.ReactNode[];
  softwareSignature?: string;
}

function ReactPlanner({
  width,
  height,
  catalog,
  translator,
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
    <PlannerProvider catalog={catalog} translator={translator}>
      <div className="flex flex-row flex-nowrap w-full h-full">
        <Toolbar toolbarButtons={toolbarButtons} />
        <Content width={width} height={contentHeight} />
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
