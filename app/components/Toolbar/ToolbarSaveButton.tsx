"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { browserDownload } from "../../utils/browser";
import { OBJExporter } from "./OBJExporter";
import { parseData } from "../viewer3d/scene-creator";
import * as Three from "three";
import { Save } from "lucide-react";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ToolbarSaveButton() {
  const { catalog } = useCatalogContext();
  const scene = usePlannerStore((state) => state.scene);
  const unselectAll = usePlannerStore((state) => state.unselectAll);

  const saveProjectToJSONFile = () => {
    // Unselect all before saving
    unselectAll();
    // Get the current scene state
    const currentScene = usePlannerStore.getState().scene;
    browserDownload(JSON.stringify(currentScene), "json");
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
      browserDownload(objExporter.parse(scene3D), "obj");
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Save size={18} />
          Save
        </Button>
      </PopoverTrigger>

      <PopoverContent side="right" className="w-80 bg-white">
        <Label>Save as</Label>
        <div>
          <Button className="w-full mb-2" onClick={saveProjectToJSONFile}>
            JSON
          </Button>
          <Button className="w-full" onClick={saveProjectToObjFile}>
            OBJ
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
