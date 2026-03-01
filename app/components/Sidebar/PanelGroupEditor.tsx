"use client";

import React, { useContext } from "react";
import Panel from "./Panel";
import { FormNumberInput, FormTextInput } from "../style/export";
import { FolderOpen, Unlink } from "lucide-react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { usePlannerStore } from "../../store";
import type { Layer } from "../../store/types";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type ElementCollection = 'lines' | 'holes' | 'items' | 'areas';

const getLayerElement = (
  layers: Record<string, Layer>,
  layerID: string,
  elementPrototype: string,
  elementID: string
): { name?: string } | undefined => {
  const layer = layers[layerID];
  if (!layer) return undefined;
  const collection = layer[elementPrototype as ElementCollection];
  if (!collection) return undefined;
  return collection[elementID];
};

interface PanelGroupEditorProps {
  groupID: string | null;
}

const PanelGroupEditor: React.FC<PanelGroupEditorProps> = ({ groupID }) => {
  const { translator } = useContext(ReactPlannerContext);
  const scene = usePlannerStore((state) => state.scene);
  const mode = usePlannerStore((state) => state.mode);
  const setGroupProperties = usePlannerStore((state) => state.setGroupProperties);
  const groupTranslate = usePlannerStore((state) => state.groupTranslate);
  const groupRotate = usePlannerStore((state) => state.groupRotate);
  const removeFromGroup = usePlannerStore((state) => state.removeFromGroup);

  if (!groupID) return null;

  const group = scene.groups?.[groupID];
  if (!group) return null;

  const elements = group.elements || {};

  return (
    <Accordion type="multiple" defaultValue={[`group-${groupID}`]}>
      <Panel
        name={translator?.t("Group [{0}]", group.name) ?? `Group [${group.name}]`}
        value={`group-${groupID}`}
        icon={<FolderOpen className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3">
            <span className="w-16 text-muted-foreground text-sm shrink-0">{translator?.t("Name") ?? "Name"}</span>
            <FormTextInput
              value={group.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGroupProperties(groupID, { name: e.target.value })
              }
              className="flex-1 text-left"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-muted-foreground text-sm shrink-0">X</span>
            <FormNumberInput
              value={group.x}
              onChange={(value: number) =>
                groupTranslate(groupID, value, group.y)
              }
              className="flex-1 text-left"
              precision={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-muted-foreground text-sm shrink-0">Y</span>
            <FormNumberInput
              value={group.y}
              onChange={(value: number) =>
                groupTranslate(groupID, group.x, value)
              }
              className="flex-1 text-left"
              precision={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-muted-foreground text-sm shrink-0">{translator?.t("Rotation") ?? "Rotation"}</span>
            <FormNumberInput
              value={group.rotation}
              onChange={(value: number) =>
                groupRotate(groupID, value)
              }
              className="flex-1 text-left"
              precision={2}
            />
          </div>

          {Object.keys(elements).length > 0 ? (
            <div>
              <p className="text-center border-b border-border/40 pb-3 text-muted-foreground">
                {translator?.t("Group's Elements") ?? "Group's Elements"}
              </p>
              <div className="space-y-2 mt-3 max-h-80 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground">
                  <div></div>
                  <div>{translator?.t("Layer") ?? "Layer"}</div>
                  <div>{translator?.t("Prototype") ?? "Prototype"}</div>
                  <div>{translator?.t("Name") ?? "Name"}</div>
                </div>
                {Object.entries(elements).map(([layerID, layerElements]) => {
                  return Object.entries(layerElements || {}).map(
                    ([elementPrototype, elementList]) => {
                      const ids = Array.isArray(elementList)
                        ? elementList
                        : Object.keys(elementList || {});
                      return ids.map((elementID: string) => {
                        const element =
                          getLayerElement(scene.layers, layerID, elementPrototype, elementID);
                        return (
                          <div key={elementID} className="grid grid-cols-4 gap-2 text-xs items-center">
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 text-foreground hover:text-destructive"
                                title={translator?.t("Un-chain Element from Group") ?? "Un-chain Element from Group"}
                                onClick={() =>
                                  removeFromGroup(
                                    groupID,
                                    layerID,
                                    elementPrototype,
                                    elementID
                                  )
                                }
                              >
                                <Unlink className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="text-center truncate">{layerID}</div>
                            <div className="text-center capitalize">{elementPrototype}</div>
                            <div className="text-center truncate">{element?.name || elementID}</div>
                          </div>
                        );
                      });
                    }
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </Accordion>
  );
};

export default PanelGroupEditor;
