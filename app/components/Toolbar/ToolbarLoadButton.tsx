"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { browserUpload } from "../../utils/browser";
import { Upload } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

export default function ToolbarLoadButton() {
  const loadProject = usePlannerStore((state) => state.loadProject);

  const loadProjectFromFile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    browserUpload().then((data) => {
      loadProject(data as any);
    });
  };

  return (
    <ToolbarButton
      active={false}
      tooltip="Load Project"
      onClick={(e) => loadProjectFromFile(e)}
    >
      <Upload size={20} />
    </ToolbarButton>
  );
}
