"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ToolbarButton from "./ToolbarButton";
import { browserUpload } from "../../utils/browser";
import { MdFileUpload } from "react-icons/md";

const ToolbarLoadButton = ({ state }) => {
  const { projectActions, translator } = useContext(ReactPlannerContext);

  let loadProjectFromFile = (event) => {
    event.preventDefault();
    browserUpload().then((data) => {
      projectActions.loadProject(JSON.parse(data));
    });
  };

  return (
    <ToolbarButton
      active={false}
      tooltip={translator.t("Load project")}
      onClick={loadProjectFromFile}
    >
      <MdFileUpload className="mb-0.5" size={25} />
      Upload
    </ToolbarButton>
  );
};

ToolbarLoadButton.propTypes = {
  state: PropTypes.object.isRequired,
};

export default ToolbarLoadButton;
