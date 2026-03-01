"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import ToolbarButton from "./ToolbarButton";
import ToolbarSaveButton from "./ToolbarSaveButton";
import ToolbarLoadButton from "./ToolbarLoadButton";
import ScreenshotToolbarButton from "./ScreenshotToolbarButton";
import {
  MODE_IDLE,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
} from "../../store/types";
import {
  File,
  MousePointer,
  Redo,
  Rotate3D,
  Square,
  Undo,
} from "lucide-react";
import TipsButton from "./TipsButton";
import SettingsButton from "./SettingsButton";
import CatalogButton from "./CatalogButton";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  toolbarButtons?: React.ReactNode[];
  allowProjectFileSupport?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolbarButtons = [],
  allowProjectFileSupport = true,
}) => {
  const { translator } = useCatalogContext();

  // Get state and actions from Zustand
  const mode = usePlannerStore((state) => state.mode);
  const newProject = usePlannerStore((state) => state.newProject);
  const setMode = usePlannerStore((state) => state.setMode);
  const selectTool3DView = usePlannerStore((state) => state.selectTool3DView);
  const undo = usePlannerStore((state) => state.undo);
  const redo = usePlannerStore((state) => state.redo);

  const { open } = useSidebar();
  const t = (text: string) => translator?.t(text) ?? text;

  return (
    <div className="fixed flex flex-col space-y-2 h-fit top-4 left-4 z-50  bg-black p-2 rounded-lg">
      <Tooltip delayDuration={0} defaultOpen={false}>
        <TooltipTrigger asChild>
          <SidebarTrigger className="mr-2 w-full" />
        </TooltipTrigger>

        <TooltipContent side="right">
          <p className="text-xs">{open ? "Close Sidebar" : "Open Sidebar"}</p>
        </TooltipContent>
      </Tooltip>

      {allowProjectFileSupport && (
        <ToolbarButton
          active={false}
          tooltip={t("New project")}
          onClick={() =>
            window.confirm(t("Would you want to start a new Project?"))
              ? newProject()
              : null
          }
        >
          <File size={25} />
          New
        </ToolbarButton>
      )}

      {allowProjectFileSupport && <ToolbarSaveButton />}
      {allowProjectFileSupport && <ToolbarLoadButton />}

      <CatalogButton />

      <ToolbarButton
        active={mode === MODE_IDLE}
        tooltip="2D View"
        onClick={() => setMode(MODE_IDLE)}
      >
        {[MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode) ? (
          <Square size={23} />
        ) : (
          <MousePointer size={23} />
        )}
        2D
      </ToolbarButton>

      <ToolbarButton
        active={mode === MODE_3D_VIEW}
        tooltip="3D View"
        onClick={() => selectTool3DView()}
      >
        <Rotate3D size={23} />
        3D
      </ToolbarButton>

      <ToolbarButton
        active={false}
        tooltip="Undo (CTRL-Z)"
        onClick={() => undo()}
      >
        <Undo size={23} />
        Undo
      </ToolbarButton>

      <ToolbarButton
        active={false}
        tooltip="Redo (CTRL-Y)"
        onClick={() => redo()}
      >
        <Redo size={23} />
        Redo
      </ToolbarButton>

      <SettingsButton />
      <TipsButton />

      <ScreenshotToolbarButton />
    </div>
  );
};

Toolbar.displayName = "Toolbar";

export default Toolbar;
