"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { browserDownloadWithName } from "../../utils/browser";
import { OBJExporter } from "./OBJExporter";
import { parseData } from "../viewer3d/scene-creator";
import * as Three from "three";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ToolbarSaveButton() {
  const { catalog } = useCatalogContext();
  const unselectAll = usePlannerStore((state) => state.unselectAll);
  const markClean = usePlannerStore((state) => state.markClean);

  const [isOpen, setIsOpen] = useState(false);
  const filenameRef = useRef("archipi-project");
  const [filename, setFilename] = useState(filenameRef.current);

  // Listen for custom save event (Ctrl+S)
  useEffect(() => {
    const handleSaveEvent = () => setIsOpen(true);
    window.addEventListener("archipi:save", handleSaveEvent);
    return () => window.removeEventListener("archipi:save", handleSaveEvent);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFilename(filenameRef.current);
    }
    setIsOpen(open);
  };

  const saveProjectToJSONFile = () => {
    unselectAll();
    const currentScene = usePlannerStore.getState().scene;
    const name = filename.trim() || "archipi-project";
    browserDownloadWithName(JSON.stringify(currentScene), name, "json");
    filenameRef.current = name;
    markClean();
    setIsOpen(false);
    toast.success(`Saved as ${name}.json`);
  };

  const saveProjectToObjFile = () => {
    if (!catalog) return;

    const objExporter = new OBJExporter();
    unselectAll();

    const currentScene = usePlannerStore.getState().scene;
    const actions = {
      selectLine: usePlannerStore.getState().selectLine,
      selectHole: usePlannerStore.getState().selectHole,
      selectItem: usePlannerStore.getState().selectItem,
      selectArea: usePlannerStore.getState().selectArea,
    };

    const planData = parseData(currentScene, actions, catalog);
    setTimeout(() => {
      const plan = planData.plan;
      plan.position.set(plan.position.x, 0.1, plan.position.z);
      const scene3D = new Three.Scene();
      scene3D.add(planData.plan);
      const name = filename.trim() || "archipi-project";
      browserDownloadWithName(objExporter.parse(scene3D), name, "obj");
      filenameRef.current = name;
      markClean();
      setIsOpen(false);
      toast.success(`Exported as ${name}.obj`);
    });
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleOpenChange(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-[hsl(217_91%_60%/0.08)] hover:text-foreground transition-all duration-200 ease-out"
            >
              <Save size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Save ({typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl+"}S)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[400px] text-foreground">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Enter a filename and choose a format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="save-filename" className="text-xs">
              Filename
            </Label>
            <Input
              id="save-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="archipi-project"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveProjectToJSONFile();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={saveProjectToObjFile}>
              Export as OBJ
            </Button>
            <Button onClick={saveProjectToJSONFile}>Save as JSON</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
