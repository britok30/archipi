"use client";

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { FaTrash, FaTimes } from "react-icons/fa";
import { FormNumberInput } from "../style/export";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import { Trash, X } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";

const PanelGuides = ({ state }) => {
  const { projectActions, translator } = useContext(ReactPlannerContext);
  const { guides } = state.scene;

  const [selectedTab, setSelectedTab] = useState("Horizontal");

  const [addHGVisible, setAddHGVisible] = useState(true);
  const [addVGVisible, setAddVGVisible] = useState(true);
  // const [addCGVisible, setAddCGVisible] = useState(true);

  return (
    <Panel name="Guides">
      <Tabs defaultValue="horizontal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            className="data-[state=active]:bg-black data-[state=active]:text-white p-2"
            value="horizontal"
          >
            Horizontal
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-black data-[state=active]:text-white p-2"
            value="vertical"
          >
            Vertical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="horizontal">
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
                      <Button
                        variant="ghost"
                        onClick={(e) =>
                          projectActions.removeHorizontalGuide(hgKey)
                        }
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  );
                })}
            </div>

            {addHGVisible && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => setAddHGVisible(false)}
              >
                Add Horizontal Guide
              </Button>
            )}

            {!addHGVisible && (
              <>
                <span className="text-xs mb-4 inline-block">{`Value must be between 0 and ${state.getIn(
                  ["scene", "width"]
                )} `}</span>
                <div className="flex items-center justify-between">
                  <FormNumberInput
                    value={0}
                    onChange={(value) => {
                      projectActions.addHorizontalGuide(value);
                      setAddHGVisible(true);
                    }}
                    min={0}
                    max={state.getIn(["scene", "width"])}
                    className="w-[280px] mr-3"
                  />

                  <Button
                    variant="ghost"
                    onClick={(e) => setAddHGVisible(true)}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </>
            )}
          </>
        </TabsContent>

        <TabsContent value="vertical">
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
                      <Button
                        variant="ghost"
                        onClick={(e) =>
                          projectActions.removeVerticalGuide(vgKey)
                        }
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  );
                })}
            </div>

            {addVGVisible && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => setAddVGVisible(false)}
              >
                Add Vertical Guide
              </Button>
            )}

            {!addVGVisible && (
              <>
                <span className="text-xs mb-4 inline-block">{`Value must be between 0 and ${state.getIn(
                  ["scene", "height"]
                )}`}</span>
                <div className="flex items-center justify-between">
                  <FormNumberInput
                    value={0}
                    onChange={(value) => {
                      projectActions.addVerticalGuide(value);
                      setAddVGVisible(true);
                    }}
                    min={0}
                    max={state.getIn(["scene", "height"])}
                    className="w-[280px] mr-3"
                  />

                  <Button
                    variant="ghost"
                    onClick={(e) => setAddVGVisible(true)}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </>
            )}
          </>
        </TabsContent>
      </Tabs>
    </Panel>
  );
};

PanelGuides.propTypes = {
  state: PropTypes.object.isRequired,
};

export default PanelGuides;
