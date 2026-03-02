"use client";

import React, { useState } from "react";
import { usePlannerStore } from "../store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProjectConfigurator: React.FC = () => {
  const scene = usePlannerStore((state) => state.scene);
  const setProjectProperties = usePlannerStore((state) => state.setProjectProperties);
  const rollback = usePlannerStore((state) => state.rollback);

  const [dataWidth, setDataWidth] = useState(scene.width.toString());
  const [dataHeight, setDataHeight] = useState(scene.height.toString());

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const width = parseInt(dataWidth);
    const height = parseInt(dataHeight);
    if (width <= 100 || height <= 100) {
      alert("Scene size too small");
    } else {
      setProjectProperties({ width, height });
    }
  };

  return (
    <div className="bg-black flex flex-col w-full min-h-screen items-center justify-center">
      <h1 className="text-4xl text-white mb-4">Project Config</h1>

      <form onSubmit={onSubmit} className="w-[500px]">
        <div className="mb-3">
          <Label htmlFor="width" className="mb-2">
            Width
          </Label>
          <Input
            type="number"
            id="width"
            name="width"
            placeholder="width"
            value={dataWidth}
            onChange={(e) => setDataWidth(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label htmlFor="height" className="mb-2">
            Height
          </Label>
          <Input
            type="number"
            id="height"
            name="height"
            placeholder="height"
            value={dataHeight}
            onChange={(e) => setDataHeight(e.target.value)}
          />
        </div>

        <div className="flex space-x-3 items-center">
          <Button
            variant="destructive"
            onClick={() => rollback()}
          >
            Cancel
          </Button>
          <Button variant="secondary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectConfigurator;
