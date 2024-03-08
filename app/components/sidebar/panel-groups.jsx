"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import Panel from "./panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import * as SharedStyle from "../../styles/shared-style";
import { TiPlus } from "react-icons/ti";
import { FaTrash, FaEye, FaLink, FaUnlink } from "react-icons/fa";
import { Map } from "immutable";

import {
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_FITTING_IMAGE,
  MODE_UPLOADING_IMAGE,
  MODE_ROTATING_ITEM,
} from "../../utils/constants";

const VISIBILITY_MODE = {
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_FITTING_IMAGE,
  MODE_UPLOADING_IMAGE,
  MODE_ROTATING_ITEM,
};

const styleEditButton = {
  marginLeft: "5px",
  border: "0px",
  background: "none",
  color: SharedStyle.COLORS.white,
  fontSize: "14px",
  outline: "0px",
};

const tablegroupStyle = {
  width: "100%",
  cursor: "pointer",
  maxHeight: "20em",
  padding: "0 1em",
  marginLeft: "1px",
};

const iconColStyle = { width: "2em", textAlign: "center" };
const styleHoverColor = { color: SharedStyle.SECONDARY_COLOR.main };
const styleEditButtonHover = { ...styleEditButton, ...styleHoverColor };
const styleEyeVisible = { fontSize: "1.25em" };
const styleEyeHidden = { ...styleEyeVisible, color: "#a5a1a1" };

const PanelGroups = ({ mode, groups, layers }) => {
  const { translator, groupsActions } = useContext(ReactPlannerContext);

  if (!VISIBILITY_MODE[mode]) return null;

  const selectClick = (groupID) => groupsActions.selectGroup(groupID);

  const swapVisibility = (e, groupID, group) => {
    e.stopPropagation();
    groupsActions.setGroupProperties(
      groupID,
      new Map({ visible: !group.get("visible") })
    );
  };

  const chainToGroup = (groupID) => {
    layers.forEach((layer) => {
      let layerID = layer.get("id");
      let layerElements = {
        lines: layer.get("lines"),
        items: layer.get("items"),
        holes: layer.get("holes"),
        areas: layer.get("areas"),
      };

      for (let elementPrototype in layerElements) {
        let ElementList = layerElements[elementPrototype];
        ElementList.filter((el) => el.get("selected")).forEach((element) => {
          groupsActions.addToGroup(
            groupID,
            layerID,
            elementPrototype,
            element.get("id")
          );
        });
      }
    });

    selectClick(groupID);
  };

  return (
    <Panel name={translator.t("Groups")} opened={groups.size > 0}>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <h3>Elements</h3>
        <h3>Names</h3>
      </div>

      <div className="mb-2">
        {groups.entrySeq().map(([groupID, group]) => {
          let isCurrentgroup = group.get("selected");
          let shouldHighlight = isCurrentgroup;

          let dimension = group.get("elements").reduce((sum, layer) => {
            return sum + layer.reduce((lSum, elProt) => lSum + elProt.size, 0);
          }, 0);

          return (
            <div className="grid grid-cols-2 mb-3" key={group}>
              <div className="flex items-center space-x-3">
                <button onClick={(e) => swapVisibility(e, groupID, group)}>
                  <FaEye
                    style={
                      !group.get("visible") ? styleEyeHidden : styleEyeVisible
                    }
                  />
                </button>

                <button onClick={() => chainToGroup(groupID)}>
                  <FaLink
                    style={
                      !shouldHighlight ? styleEditButton : styleEditButtonHover
                    }
                  />
                </button>

                <button onClick={() => groupsActions.removeGroup(groupID)}>
                  <FaUnlink
                    style={
                      !shouldHighlight ? styleEditButton : styleEditButtonHover
                    }
                  />
                </button>

                <button
                  onClick={() =>
                    groupsActions.removeGroupAndDeleteElements(groupID)
                  }
                >
                  <FaTrash
                    style={
                      !shouldHighlight ? styleEditButton : styleEditButtonHover
                    }
                  />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {dimension}
                {group.get("name")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2">
        <button
          className="flex items-center space-x-3"
          onClick={(e) => groupsActions.addGroup()}
        >
          <TiPlus />
          New Empty Group
        </button>

        <button
          className="flex items-center space-x-3"
          onClick={(e) => groupsActions.addGroupFromSelected()}
        >
          <TiPlus />
          New Group from selected
        </button>
      </div>
    </Panel>
  );
};

PanelGroups.displayName = "PanelGroups";

PanelGroups.propTypes = {
  mode: PropTypes.string.isRequired,
  groups: PropTypes.object.isRequired,
  layers: PropTypes.object.isRequired,
};

export default PanelGroups;
