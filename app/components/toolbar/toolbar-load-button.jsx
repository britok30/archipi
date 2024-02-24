"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ToolbarButton from "./toolbar-button";
import { browserUpload } from "../../utils/browser";
import { MdFrontLoader } from "react-icons/md";

export default function ToolbarLoadButton({ state }) {
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
      <MdFrontLoader />
      Load
    </ToolbarButton>
  );
}

ToolbarLoadButton.propTypes = {
  state: PropTypes.object.isRequired,
};
