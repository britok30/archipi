"use client";

import React, { useContext } from "react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ToolbarButton from "./ToolbarButton";
import ToolbarSaveButton from "./ToolbarSaveButton";
import ToolbarLoadButton from "./ToolbarLoadButton";
import ScreenshotToolbarButton from "./ScreenshotToolbarButton";
import { IoIosDocument, IoIosUndo, IoIosRedo } from "react-icons/io";
import { FaBookOpen, FaMousePointer, FaCube } from "react-icons/fa";
import { IoSquare, IoSettingsSharp } from "react-icons/io5";
import {
  MODE_IDLE,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from "../../utils/constants";
import {
  Book,
  Box,
  File,
  MousePointer,
  Redo,
  Rotate3D,
  Settings,
  Square,
  Undo,
  User,
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
  state: any;
  allowProjectFileSupport: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  state,
  allowProjectFileSupport,
}) => {
  const { projectActions, viewer3DActions, translator } =
    useContext(ReactPlannerContext);
  const mode = state.get("mode");
  const { open } = useSidebar();

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
          tooltip={translator.t("New project")}
          onClick={() =>
            window.confirm(
              translator.t("Would you want to start a new Project?")
            )
              ? projectActions.newProject()
              : null
          }
        >
          <File size={25} />
          New
        </ToolbarButton>
      )}

      {allowProjectFileSupport && <ToolbarSaveButton state={state} />}
      {allowProjectFileSupport && <ToolbarLoadButton state={state} />}

      <CatalogButton state={state} mode={mode} />

      {/* <ToolbarButton
        active={mode === MODE_VIEWING_CATALOG}
        tooltip="Open Catalog"
        onClick={() => projectActions.openCatalog()}
      >
        <Book size={23} />
        Catalog
      </ToolbarButton> */}

      <ToolbarButton
        active={mode === MODE_IDLE}
        tooltip="2D View"
        onClick={() => projectActions.setMode(MODE_IDLE)}
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
        onClick={() => viewer3DActions.selectTool3DView()}
      >
        <Rotate3D size={23} />
        3D
      </ToolbarButton>

      {/* <ToolbarButton
        active={mode === MODE_3D_FIRST_PERSON}
        tooltip="3D First Person"
        onClick={() => viewer3DActions.selectTool3DFirstPerson()}
      >
        <User className="mb-0.5" size={23} />
        3D First
      </ToolbarButton> */}

      <ToolbarButton
        active={false}
        tooltip="Undo (CTRL-Z)"
        onClick={() => projectActions.undo()}
      >
        <Undo size={23} />
        Undo
      </ToolbarButton>

      <ToolbarButton
        active={false}
        tooltip="Redo (CTRL-Y)"
        onClick={() => projectActions.redo()}
      >
        <Redo size={23} />
        Redo
      </ToolbarButton>

      {/* <ToolbarButton
        active={mode === MODE_CONFIGURING_PROJECT}
        tooltip="Configure project"
        onClick={() => projectActions.openProjectConfigurator()}
      >
        <Settings size={23} />
        Settings
      </ToolbarButton> */}

      <SettingsButton state={state} />
      <TipsButton />

      <ScreenshotToolbarButton mode={mode} />
    </div>
  );
};

Toolbar.displayName = "Toolbar";

export default Toolbar;
