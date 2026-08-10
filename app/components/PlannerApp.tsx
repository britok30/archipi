"use client";

import React, { Suspense } from "react";
import MyCatalog from "../objCatalog/mycatalog";

import ReactPlanner from "./ReactPlanner";
import { useWindowSize } from "../hooks/useWindowSize";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * Client-only planner shell. Always renders a full-viewport container so the
 * page layout is identical on the server, before hydration, and after the
 * window has been measured — the landing content below never shifts (no CLS).
 */
export default function PlannerApp() {
  const { windowSize, isMobile } = useWindowSize();
  const height = windowSize.height;
  const width = windowSize.width;

  return (
    <div className="w-full h-screen overflow-hidden">
      {height && width ? (
        isMobile ? (
          <div className="w-full h-full flex items-center flex-col justify-center text-center px-4">
            <h2>Please use a desktop browser</h2>
            <p className="font-light text-sm">
              For the best possible experience, please use a desktop browser to
              access ArchiPi
            </p>
          </div>
        ) : (
          <SidebarProvider>
            <Suspense fallback="Loading...">
              <ReactPlanner
                catalog={MyCatalog as any}
                width={width}
                height={height}
              />
            </Suspense>
          </SidebarProvider>
        )
      ) : null}
    </div>
  );
}
