"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { usePlannerStore } from "../../store";
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
import { useCanUndo, useCanRedo } from "../../store/usePlannerStore";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  toolbarButtons?: React.ReactNode[];
  allowProjectFileSupport?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolbarButtons = [],
  allowProjectFileSupport = true,
}) => {
  const mode = usePlannerStore((state) => state.mode);
  const newProject = usePlannerStore((state) => state.newProject);
  const markClean = usePlannerStore((state) => state.markClean);
  const setMode = usePlannerStore((state) => state.setMode);
  const selectTool3DView = usePlannerStore((state) => state.selectTool3DView);
  const undo = usePlannerStore((state) => state.undo);
  const redo = usePlannerStore((state) => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  const { open } = useSidebar();
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);
  const mod = isMac ? "⌘" : "Ctrl+";
  const handleNewProjectConfirm = () => {
    newProject();
    markClean();
    setNewProjectDialogOpen(false);
    toast.success("New project created");
  };

  return (
    <>
      <div className="fixed flex flex-col h-fit top-4 left-4 z-50 toolbar-glass rounded-xl p-1.5 space-y-1">
        {/* Navigation */}
        <Tooltip delayDuration={0} defaultOpen={false}>
          <TooltipTrigger asChild>
            <SidebarTrigger className="w-10 h-10 rounded-lg text-muted-foreground hover:bg-[hsl(217_91%_60%/0.08)] hover:text-foreground transition-all duration-200" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">{open ? "Close Sidebar" : "Open Sidebar"}</p>
          </TooltipContent>
        </Tooltip>

        <Separator className="bg-border/40" />

        {/* Project */}
        {allowProjectFileSupport && (
          <>
            <ToolbarButton
              active={false}
              tooltip="New project"
              onClick={() => setNewProjectDialogOpen(true)}
            >
              <File size={20} />
            </ToolbarButton>

            <ToolbarSaveButton />
            <ToolbarLoadButton />
          </>
        )}

        <Separator className="bg-border/40" />

        {/* Design */}
        <CatalogButton />

        <ToolbarButton
          active={mode === MODE_IDLE}
          tooltip="2D View"
          onClick={() => setMode(MODE_IDLE)}
        >
          {[MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode) ? (
            <Square size={20} />
          ) : (
            <MousePointer size={20} />
          )}
        </ToolbarButton>

        <ToolbarButton
          active={mode === MODE_3D_VIEW}
          tooltip="3D View"
          onClick={() => selectTool3DView()}
        >
          <Rotate3D size={20} />
        </ToolbarButton>

        <Separator className="bg-border/40" />

        {/* History */}
        <ToolbarButton
          active={false}
          disabled={!canUndo}
          tooltip={`Undo (${mod}Z)`}
          onClick={() => undo()}
        >
          <Undo size={20} />
        </ToolbarButton>

        <ToolbarButton
          active={false}
          disabled={!canRedo}
          tooltip={`Redo (${mod}${isMac ? "⇧Z" : "Y"})`}
          onClick={() => redo()}
        >
          <Redo size={20} />
        </ToolbarButton>

        <Separator className="bg-border/40" />

        {/* Utility */}
        <SettingsButton />
        <TipsButton />
        <ScreenshotToolbarButton />
      </div>

      {/* New Project Confirmation Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-[400px] text-foreground">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Any unsaved changes will be lost. Are you sure you want to start a
              new project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNewProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNewProjectConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

Toolbar.displayName = "Toolbar";

export default Toolbar;
