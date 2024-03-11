"use client";

import React from "react";
import MyCatalog from "./objCatalog/mycatalog";
import "./styles/react-planner.css";
import { Plugins as PlannerPlugins } from "./plugins";
import { useWindowSize } from "./hooks/useWindowSize";
import { store } from "./components/Providers";
import ReactPlanner from "./components/ReactPlanner";

let plugins = [PlannerPlugins.Keyboard(), PlannerPlugins.Autosave("archipi")];

export default function Home() {
  const size = useWindowSize();
  const height = size.height;
  const width = size.width;

  if (!height || !width) return <></>;

  return (
    <div className="w-full min-h-screen">
      <ReactPlanner
        store={store}
        catalog={MyCatalog}
        width={width}
        height={height}
        plugins={plugins}
        stateExtractor={(state) => state.get("archipi")}
      />
    </div>
  );
}
