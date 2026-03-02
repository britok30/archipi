"use client";

import React, { useState, useContext } from "react";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { FormNumberInput } from "../FormNumberInput";
import { Button } from "@/components/ui/button";
import { Ruler, Trash, X } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { usePlannerStore } from "../../store";

const PanelGuides: React.FC = () => {
  const { translator } = useContext(ReactPlannerContext);
  const scene = usePlannerStore((state) => state.scene);
  const addHorizontalGuide = usePlannerStore((state) => state.addHorizontalGuide);
  const addVerticalGuide = usePlannerStore((state) => state.addVerticalGuide);
  const removeHorizontalGuide = usePlannerStore((state) => state.removeHorizontalGuide);
  const removeVerticalGuide = usePlannerStore((state) => state.removeVerticalGuide);

  const guides = scene.guides || { horizontal: {}, vertical: {} };
  const horizontalEntries = Object.entries(guides.horizontal || {});
  const verticalEntries = Object.entries(guides.vertical || {});

  const [addHGVisible, setAddHGVisible] = useState(true);
  const [addVGVisible, setAddVGVisible] = useState(true);

  return (
    <Panel name="Guides" value="guides" icon={<Ruler className="w-3.5 h-3.5" />}>
      <Tabs defaultValue="horizontal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2"
            value="horizontal"
          >
            Horizontal
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2"
            value="vertical"
          >
            Vertical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="horizontal">
          <>
            <div className="my-4">
              {horizontalEntries.map(([hgKey, hgValue], index) => (
                <div
                  key={hgKey}
                  className="flex items-center justify-between mb-2"
                >
                  <span>{index + 1}</span>
                  <span>{(hgValue as { y: number }).y}</span>
                  <Button
                    variant="ghost"
                    onClick={() => removeHorizontalGuide(hgKey)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
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
                <span className="text-xs mb-4 inline-block text-muted-foreground">{`Value must be between 0 and ${scene.width} `}</span>
                <div className="flex items-center justify-between">
                  <FormNumberInput
                    value={0}
                    onChange={(value: number) => {
                      addHorizontalGuide(value);
                      setAddHGVisible(true);
                    }}
                    min={0}
                    max={scene.width}
                    className="w-[280px] mr-3"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => setAddHGVisible(true)}
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
              {verticalEntries.map(([vgKey, vgValue], index) => (
                <div
                  key={vgKey}
                  className="flex items-center justify-between mb-2"
                >
                  <span>{index + 1}</span>
                  <span>{(vgValue as { x: number }).x}</span>
                  <Button
                    variant="ghost"
                    onClick={() => removeVerticalGuide(vgKey)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
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
                <span className="text-xs mb-4 inline-block text-muted-foreground">{`Value must be between 0 and ${scene.height}`}</span>
                <div className="flex items-center justify-between">
                  <FormNumberInput
                    value={0}
                    onChange={(value: number) => {
                      addVerticalGuide(value);
                      setAddVGVisible(true);
                    }}
                    min={0}
                    max={scene.height}
                    className="w-[280px] mr-3"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => setAddVGVisible(true)}
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

export default PanelGuides;
