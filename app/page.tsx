"use client";

import React, { Suspense } from "react";
import MyCatalog from "./objCatalog/mycatalog";
import "./styles/react-planner.css";
import ReactPlanner from "./components/ReactPlanner";
import { Plugins as PlannerPlugins } from "./customMiddlewares";
import { useWindowSize } from "./hooks/useWindowSize";
import { store } from "./components/Providers";
import { SidebarProvider } from "@/components/ui/sidebar";

let plugins = [];

export default function Home() {
  const { windowSize, isMobile } = useWindowSize();
  const height = windowSize.height;
  const width = windowSize.width;

  if (!height || !width) return <></>;

  if (isMobile) {
    return (
      <div className="0w-full min-h-screen flex items-center flex-col justify-center text-center px-4">
        <h2>Please use a desktop browser</h2>
        <p className="font-lihjy text-sm">
          For the best possible experience, please use a desktop browser to
          access ArchiPi
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <SidebarProvider>
         <Suspense fallback="Loading...">
        <ReactPlanner
          store={store}
          catalog={MyCatalog}
          width={width}
          height={height}
          plugins={plugins}
          stateExtractor={(state) => state.get("archipi")}
        />
      </Suspense>
      </SidebarProvider>
    </div>
  );
}
