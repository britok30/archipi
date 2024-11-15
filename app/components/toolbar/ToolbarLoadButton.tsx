"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { browserUpload } from "../../utils/browser";
import { Upload } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

export default function ToolbarLoadButton({ state }) {
  const { projectActions, translator } = useContext(ReactPlannerContext);

  let loadProjectFromFile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    browserUpload().then((data) => {
      projectActions.loadProject(JSON.parse(data));
    });
  };

  return (
    <ToolbarButton
      active={false}
      tooltip="Load Project"
      onClick={(e) => loadProjectFromFile(e)}
    >
      <Upload size={18} />
      Upload
    </ToolbarButton>
  );
}

ToolbarLoadButton.propTypes = {
  state: PropTypes.object.isRequired,
};
