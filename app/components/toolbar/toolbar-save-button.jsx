"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ToolbarButton from "./toolbar-button";
import { browserDownload } from "../../utils/browser";
import { Project } from "../../class";
import { OBJExporter } from "./OBJExporter";
import Dropdown from "rc-dropdown";
import Menu, { Item as MenuItem } from "rc-menu";
import { parseData } from "../viewer3d/scene-creator";

import * as Three from "three";
import { FaSave } from "react-icons/fa";

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

  const menu = (
    <Menu style={{ width: 140 }}>
      <MenuItem key="1" onClick={saveProjectToJSONFile}>
        JSON
      </MenuItem>
      <MenuItem key="2" onClick={saveProjectToObjFile}>
        OBJ
      </MenuItem>
    </Menu>
  );

  return (
    <Dropdown
      trigger={["click"]}
      overlay={menu}
      animation="slide-up"
      placement="topLeft"
    >
      <ToolbarButton active={false} tooltip={translator.t("Save project")}>
        <FaSave className="mb-0.5" size={20} />
        Save
      </ToolbarButton>
    </Dropdown>
  );
}

ToolbarSaveButton.propTypes = {
  state: PropTypes.object.isRequired,
};
