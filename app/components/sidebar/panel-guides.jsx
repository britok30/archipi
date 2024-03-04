"use client";

import React, { useState, useContext, memo } from "react";
import PropTypes from "prop-types";
import Panel from "./panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import * as SharedStyle from "../../styles/shared-style";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FaPencil, FaTrash, FaTimes } from "react-icons/fa";
import { FormNumberInput } from "../../components/style/export";

const iconStyle = {
  fontSize: "14px",
  margin: "2px",
  cursor: "pointer",
};

const addGuideStyle = {
  cursor: "pointer",
  height: "2em",
};

const tableTabStyle = {
  width: "100%",
  textAlign: "center",
};

const shouldUpdate = (prevProps, nextProps) => {
  return (
    prevProps.state.getIn(["scene", "guides"]).hashCode() !==
    nextProps.state.getIn(["scene", "guides"]).hashCode()
  );
};

const PanelGuides = memo(({ state }) => {
  const { projectActions, translator } = useContext(ReactPlannerContext);
  const { guides } = state.scene;

  const [addHGVisible, setAddHGVisible] = useState(true);
  const [addVGVisible, setAddVGVisible] = useState(true);
  const [addCGVisible, setAddCGVisible] = useState(true);

  return (
    <Panel name={translator.t("Guides")}>
      <Tabs className="m-[1rem]" id="guidesTabs">
        <TabList>
          <Tab>{translator.t("Horizontal")}</Tab>
          <Tab>{translator.t("Vertical")}</Tab>
          {/*<Tab>{translator.t('Circular')}</Tab>*/}
        </TabList>

        <TabPanel>
          <table style={tableTabStyle}>
            <tbody>
              {guides
                .get("horizontal")
                .entrySeq()
                .map(([hgKey, hgVal], ind) => {
                  return (
                    <tr key={hgKey}>
                      <td className="w-[2rem]">{ind + 1}</td>
                      <td>{hgVal}</td>
                      <td className="w-[5rem]">
                        {/*<FaPencil style={iconStyle} />*/}
                        <FaTrash
                          style={iconStyle}
                          onClick={(e) =>
                            projectActions.removeHorizontalGuide(hgKey)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              {addHGVisible ? (
                <tr>
                  <td
                    colSpan="3"
                    style={addGuideStyle}
                    onClick={(e) => setAddHGVisible(false)}
                  >
                    {translator.t("+ Add Horizontal Giude")}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="2">
                    <FormNumberInput
                      value={0}
                      onChange={(e) => {
                        projectActions.addHorizontalGuide(e.target.value);
                        return setAddHGVisible(true);
                      }}
                      min={0}
                      max={state.getIn(["scene", "height"])}
                    />
                  </td>
                  <td>
                    <FaTimes
                      style={iconStyle}
                      onClick={(e) => setAddHGVisible(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TabPanel>
        <TabPanel>
          <table style={tableTabStyle}>
            <tbody>
              {guides
                .get("vertical")
                .entrySeq()
                .map(([hgKey, hgVal], ind) => {
                  return (
                    <tr key={hgKey}>
                      <td className="w-[2rem]">{ind + 1}</td>
                      <td>{hgVal}</td>
                      <td className="w-[5rem]">
                        {/*<FaPencil style={iconStyle} />*/}
                        <FaTrash
                          style={iconStyle}
                          onClick={(e) =>
                            projectActions.removeVerticalGuide(hgKey)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              {addVGVisible ? (
                <tr>
                  <td
                    colSpan="3"
                    style={addGuideStyle}
                    onClick={(e) => setAddVGVisible(false)}
                  >
                    {translator.t("+ Add Vertical Giude")}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="2">
                    <FormNumberInput
                      value={0}
                      onChange={(e) => {
                        projectActions.addVerticalGuide(e.target.value);
                        return setAddVGVisible(true);
                      }}
                      min={0}
                      max={state.getIn(["scene", "height"])}
                    />
                  </td>
                  <td>
                    <FaTimes
                      style={iconStyle}
                      onClick={(e) => setAddVGVisible(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TabPanel>
        {/*<TabPanel>
          <b>TODO Circular Guides</b>
        </TabPanel>*/}
      </Tabs>
    </Panel>
  );
}, shouldUpdate);

PanelGuides.displayName = "PanelGuides";

PanelGuides.propTypes = {
  state: PropTypes.object.isRequired,
};

export default PanelGuides;
