"use client";

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";

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
      <h1 className="text-4xl text-white mb-4">
        {translator.t("Project config")}
      </h1>

      <form onSubmit={onSubmit} className="w-[500px]">
        <div className="mb-3">
          <label
            htmlFor="width"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Width
          </label>
          <input
            type="text"
            id="width"
            name="width"
            className="bg-[#292929] w-full text-white border-none rounded-md h-[40px] px-3 outline-none"
            placeholder="width"
            value={dataWidth}
            onChange={(e) => setDataWidth(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="height"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Height
          </label>
          <input
            type="text"
            id="height"
            name="height"
            className="bg-[#292929] w-full text-white border-none rounded-md h-[40px] px-3 outline-none"
            placeholder="height"
            value={dataHeight}
            onChange={(e) => setDataHeight(e.target.value)}
          />
        </div>

        <div className="flex space-x-3 items-center">
          <button
            className="text-white bg-[#292929] hover:bg-black focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-200 ease-in-out"
            onClick={(e) => projectActions.rollback()}
          >
            {translator.t("Cancel")}
          </button>
          <button
            className="text-black bg-white hover:bg-zinc-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-200 ease-in-out"
            type="submit"
          >
            Save
          </button>
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
