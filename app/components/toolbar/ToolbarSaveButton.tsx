"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { browserDownload } from "../../utils/browser";
import { Project } from "../../class";
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

export default function ToolbarSaveButton({ state }) {
  const context = useContext(ReactPlannerContext);
  const { translator, catalog } = context;

  const saveProjectToJSONFile = () => {
    state = Project.unselectAll(state).updatedState;
    browserDownload(JSON.stringify(state.get("scene").toJS()), "json");
  };

  const saveProjectToObjFile = () => {
    const objExporter = new OBJExporter();
    state = Project.unselectAll(state).updatedState;
    const actions = {
      areaActions: context.areaActions,
      holesActions: context.holesActions,
      itemsActions: context.itemsActions,
      linesActions: context.linesActions,
      projectActions: context.projectActions,
    };
    const scene = state.get("scene");
    let planData = parseData(scene, actions, catalog);
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

      <PopoverContent side="top" className="w-80 bg-white">
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

ToolbarSaveButton.propTypes = {
  state: PropTypes.object.isRequired,
};
