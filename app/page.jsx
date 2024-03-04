"use client";

import React from "react";
import MyCatalog from "./objCatalog/mycatalog";
import ScreenshotToolbarButton from "./ui/screenshot-toolbar-button";

import "./styles/react-planner.css";
import ReactPlanner from "./components/ReactPlanner";
import { Plugins as PlannerPlugins } from "./plugins";
import useWindowDimensions from "./hooks/useWindowDimensions";
import { store } from "./components/Providers";

let plugins = [
  PlannerPlugins.Keyboard(),
  PlannerPlugins.Autosave("archipi"),
  PlannerPlugins.ConsoleDebugger(),
];

export default function Home() {
  const { height, width } = useWindowDimensions();

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
