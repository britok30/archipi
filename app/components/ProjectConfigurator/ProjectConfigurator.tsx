"use client";

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProjectConfigurator = ({ state }) => {
  const { projectActions, translator } = useContext(ReactPlannerContext);
  const scene = state.scene;

  const [dataWidth, setDataWidth] = useState(scene.width);
  const [dataHeight, setDataHeight] = useState(scene.height);

  const onSubmit = (event) => {
    event.preventDefault();

    let width = parseInt(dataWidth);
    let height = parseInt(dataHeight);
    if (width <= 100 || height <= 100) {
      alert("Scene size too small");
    } else {
      projectActions.setProjectProperties({ width, height });
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
            onClick={(e) => projectActions.rollback()}
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

ProjectConfigurator.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
};

export default ProjectConfigurator;
