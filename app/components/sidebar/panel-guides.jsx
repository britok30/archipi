"use client";

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import Panel from "./panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { FaTrash, FaTimes } from "react-icons/fa";
import { FormNumberInput } from "../../components/style/export";
import classNames from "classnames";

const PanelGuides = ({ state }) => {
  const { projectActions, translator } = useContext(ReactPlannerContext);
  const { guides } = state.scene;

  const [selectedTab, setSelectedTab] = useState("Horizontal");

  const [addHGVisible, setAddHGVisible] = useState(true);
  const [addVGVisible, setAddVGVisible] = useState(true);
  // const [addCGVisible, setAddCGVisible] = useState(true);

  return (
    <Panel name={translator.t("Guides")}>
      <div className="flex items-center space-x-3">
        <div
          className={classNames(
            "px-3 py-2 rounded-md border border-white transition-all duration-300 ease-in-out cursor-pointer",
            {
              "border-blue-500 text-blue-500": selectedTab === "Horizontal",
            }
          )}
          onClick={() => setSelectedTab("Horizontal")}
        >
          {translator.t("Horizontal")}
        </div>
        <div
          className={classNames(
            "px-3 py-2 rounded-md border border-white transition-all duration-300 ease-in-out cursor-pointer",
            {
              "border-blue-500 text-blue-500": selectedTab === "Vertical",
            }
          )}
          onClick={() => setSelectedTab("Vertical")}
        >
          {translator.t("Vertical")}
        </div>
      </div>

      {selectedTab === "Horizontal" && (
        <>
          <div className="my-4">
            {guides
              ?.getIn(["horizontal"])
              ?.entrySeq()
              .map(([hgKey, hgValue], index) => {
                return (
                  <div
                    key={hgKey}
                    className="flex items-center justify-between mb-2"
                  >
                    <span>{index + 1}</span>
                    <span>{hgValue}</span>
                    <FaTrash
                      size={14}
                      className="cursor-pointer"
                      onClick={(e) =>
                        projectActions.removeHorizontalGuide(hgKey)
                      }
                    />
                  </div>
                );
              })}
          </div>

          {addHGVisible && (
            <button
              onClick={(e) => setAddHGVisible(false)}
              className="bg-white text-black px-3 py-2 rounded-md"
            >
              Add Horizontal Guide
            </button>
          )}

          {!addHGVisible && (
            <>
              <span className="text-xs mb-4 inline-block">{`Value must be between 0 and ${state.getIn(
                ["scene", "width"]
              )} `}</span>
              <div classNames="flex items-center justify-between">
                <FormNumberInput
                  value={0}
                  onChange={(e) => {
                    projectActions.addHorizontalGuide(e.target.value);
                    setAddHGVisible(true);
                  }}
                  min={0}
                  max={state.getIn(["scene", "width"])}
                  className="w-[280px] mr-3"
                />

                <button onClick={(e) => setAddHGVisible(true)}>
                  <FaTimes />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {selectedTab === "Vertical" && (
        <>
          <div className="my-4">
            {guides
              .get("vertical")
              .entrySeq()
              .map(([vgKey, vgValue], index) => {
                return (
                  <div
                    key={vgKey}
                    className="flex items-center justify-between mb-2"
                  >
                    <span>{index + 1}</span>
                    <span>{vgValue}</span>
                    <FaTrash
                      size={14}
                      onClick={(e) => projectActions.removeVerticalGuide(vgKey)}
                    />
                  </div>
                );
              })}
          </div>

          {addVGVisible && (
            <button
              onClick={(e) => setAddVGVisible(false)}
              className="bg-white text-black px-3 py-2 rounded-md"
            >
              Add Vertical Guide
            </button>
          )}

          {!addVGVisible && (
            <>
              <span className="text-xs mb-4 inline-block">{`Value must be between 0 and ${state.getIn(
                ["scene", "height"]
              )}`}</span>
              <div classNames="flex items-center justify-between">
                <FormNumberInput
                  value={0}
                  onChange={(e) => {
                    projectActions.addVerticalGuide(e.target.value);
                    setAddVGVisible(true);
                  }}
                  min={0}
                  max={state.getIn(["scene", "height"])}
                  className="w-[280px] mr-3"
                />

                <button onClick={(e) => setAddVGVisible(true)}>
                  <FaTimes />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Panel>
  );
};

PanelGuides.propTypes = {
  state: PropTypes.object.isRequired,
};

export default PanelGuides;
