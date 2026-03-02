"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePlannerStore } from "../../store";
import { Upload } from "lucide-react";
import ToolbarButton from "./ToolbarButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scene } from "../../store/types";

export default function ToolbarLoadButton() {
  const loadProject = usePlannerStore((state) => state.loadProject);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingData = useRef<Scene | null>(null);

  // Listen for custom load event (Ctrl+O)
  useEffect(() => {
    const handleLoadEvent = () => openFilePicker();
    window.addEventListener("archipi:load", handleLoadEvent);
    return () => window.removeEventListener("archipi:load", handleLoadEvent);
  }, []);

  const openFilePicker = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    fileInput.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener("load", (fileEvent: ProgressEvent<FileReader>) => {
        try {
          const fileContent = fileEvent.target?.result as string;
          const parsed = JSON.parse(fileContent);

          // Validate the project data
          if (!parsed || typeof parsed !== "object" || !parsed.layers || !parsed.width) {
            toast.error("Invalid project file: missing required data");
            return;
          }

          pendingData.current = parsed as Scene;
          setConfirmOpen(true);
        } catch {
          toast.error("Failed to load project: invalid JSON file");
        }
      });

      reader.addEventListener("error", () => {
        toast.error("Failed to read file");
      });

      reader.readAsText(file);
    });

    fileInput.click();
  };

  const handleConfirmLoad = () => {
    if (pendingData.current) {
      loadProject(pendingData.current);
      toast.success("Project loaded");
      pendingData.current = null;
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    pendingData.current = null;
    setConfirmOpen(false);
  };

  return (
    <>
      <ToolbarButton
        active={false}
        tooltip={`Load Project (${typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl+"}O)`}
        onClick={openFilePicker}
      >
        <Upload size={20} />
      </ToolbarButton>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[400px] text-foreground">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription>
              This will replace your current work. Any unsaved changes will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLoad}>Load</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
