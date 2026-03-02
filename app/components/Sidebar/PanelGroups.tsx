"use client";

import React from "react";
import Panel from "./Panel";
import { Eye, EyeOff, Link, Unlink, Trash, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlannerStore } from "../../store";
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
} from "../../store/types";
import type { Group, Layer } from "../../store/types";

const VISIBILITY_MODES = [
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
  MODE_ROTATING_ITEM,
  MODE_UPLOADING_IMAGE,
  MODE_FITTING_IMAGE,
];

const PanelGroups: React.FC = () => {
  const mode = usePlannerStore((state) => state.mode);
  const scene = usePlannerStore((state) => state.scene);
  const selectGroup = usePlannerStore((state) => state.selectGroup);
  const setGroupProperties = usePlannerStore((state) => state.setGroupProperties);
  const addToGroup = usePlannerStore((state) => state.addToGroup);
  const removeGroup = usePlannerStore((state) => state.removeGroup);
  const removeGroupAndDeleteElements = usePlannerStore((state) => state.removeGroupAndDeleteElements);
  const addGroup = usePlannerStore((state) => state.addGroup);
  const addGroupFromSelected = usePlannerStore((state) => state.addGroupFromSelected);

  const groups = scene.groups || {};
  const layers = scene.layers || {};

  if (!VISIBILITY_MODES.includes(mode)) return null;

  const selectClick = (groupID: string) => selectGroup(groupID);

  const swapVisibility = (e: React.MouseEvent, groupID: string, group: Group) => {
    e.stopPropagation();
    setGroupProperties(groupID, { visible: !group.visible });
  };

  const chainToGroup = (groupID: string) => {
    Object.values(layers).forEach((layer: Layer) => {
      const layerID = layer.id;
      const layerElements: Record<string, Record<string, { id: string; selected: boolean }>> = {
        lines: layer.lines || {},
        items: layer.items || {},
        holes: layer.holes || {},
        areas: layer.areas || {},
      };

      for (let elementPrototype in layerElements) {
        const elements = layerElements[elementPrototype];
        Object.values(elements)
          .filter((el) => el.selected)
          .forEach((element) => {
            addToGroup(groupID, layerID, elementPrototype, element.id);
          });
      }
    });

    selectClick(groupID);
  };

  const groupEntries = Object.entries(groups);

  return (
    <Panel
      name="Groups"
      value="groups"
      icon={<FolderOpen className="w-3.5 h-3.5" />}
    >
      <div className="grid grid-cols-6 text-sm text-muted-foreground">
        <div className="col-span-2">Actions</div>
        <div className="col-span-2">Elements</div>
        <div className="col-span-2">Name</div>
      </div>

      <div className="mb-2">
        {groupEntries
          .map(([groupID, group]: [string, Group]) => {
            const isCurrentGroup = group.selected;
            const elements = group.elements || {};
            const dimension = Object.values(elements).reduce<number>((sum, layerEls) => {
              return sum + Object.values(layerEls || {}).reduce<number>((lSum, elProt) => {
                if (Array.isArray(elProt)) return lSum + elProt.length;
                if (typeof elProt === 'object' && elProt !== null) return lSum + Object.keys(elProt).length;
                return lSum;
              }, 0);
            }, 0);

            return (
              <div key={groupID} className="grid grid-cols-6 mb-3">
                <div className="flex col-span-2 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={(e) => swapVisibility(e, groupID, group)}
                  >
                    {group.visible ? (
                      <Eye className="w-4 h-4 text-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => chainToGroup(groupID)}
                  >
                    <Link className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => removeGroup(groupID)}
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => removeGroupAndDeleteElements(groupID)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                <div className="col-span-2 flex items-center text-foreground">
                  {Object.values(elements)
                    .reduce<string[]>((acc, layerEls) => {
                      Object.values(layerEls || {}).forEach((elProt) => {
                        const size = Array.isArray(elProt)
                          ? elProt.length
                          : (typeof elProt === 'object' && elProt !== null)
                            ? Object.keys(elProt).length
                            : 0;
                        if (size > 0) {
                          acc.push(size.toString());
                        }
                      });
                      return acc;
                    }, [])
                    .join(", ")}
                </div>

                <div className="col-span-2 flex items-center text-foreground">
                  {dimension} {group.name}
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => addGroup()}>
          <span>New Empty Group</span>
        </Button>

        <Button size="sm" onClick={() => addGroupFromSelected()}>
          <span>New Group From Selected</span>
        </Button>
      </div>
    </Panel>
  );
};

export default PanelGroups;
