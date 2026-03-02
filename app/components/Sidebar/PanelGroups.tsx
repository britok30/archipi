"use client";

import React from "react";
import Panel from "./Panel";
import { Eye, EyeOff, Link, Unlink, Trash, FolderOpen, Plus } from "lucide-react";
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

const countGroupElements = (elements: Group["elements"]): number => {
  if (!elements) return 0;
  return Object.values(elements).reduce<number>((sum, layerEls) => {
    return sum + Object.values(layerEls || {}).reduce<number>((lSum, elProt) => {
      if (Array.isArray(elProt)) return lSum + elProt.length;
      if (typeof elProt === "object" && elProt !== null) return lSum + Object.keys(elProt).length;
      return lSum;
    }, 0);
  }, 0);
};

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

  const swapVisibility = (e: React.MouseEvent, groupID: string, group: Group) => {
    e.stopPropagation();
    setGroupProperties(groupID, { visible: !group.visible });
  };

  const chainToGroup = (e: React.MouseEvent, groupID: string) => {
    e.stopPropagation();
    Object.values(layers).forEach((layer: Layer) => {
      const layerID = layer.id;
      const layerElements: Record<string, Record<string, { id: string; selected: boolean }>> = {
        lines: layer.lines || {},
        items: layer.items || {},
        holes: layer.holes || {},
        areas: layer.areas || {},
      };

      for (const elementPrototype in layerElements) {
        const elements = layerElements[elementPrototype];
        Object.values(elements)
          .filter((el) => el.selected)
          .forEach((element) => {
            addToGroup(groupID, layerID, elementPrototype, element.id);
          });
      }
    });

    selectGroup(groupID);
  };

  const groupEntries = Object.entries(groups);

  return (
    <Panel
      name="Groups"
      value="groups"
      icon={<FolderOpen className="w-3.5 h-3.5" />}
    >
      {groupEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No groups
        </p>
      ) : (
        <div className="space-y-0.5">
          {groupEntries.map(([groupID, group]: [string, Group]) => {
            const elementCount = countGroupElements(group.elements);

            return (
              <div
                key={groupID}
                className={`grid grid-cols-[1fr_auto] items-center cursor-pointer hover:bg-muted/50 transition duration-200 ease-in-out py-2 px-2 rounded-md ${
                  group.selected ? "bg-primary/10" : ""
                }`}
                onClick={() => selectGroup(groupID)}
              >
                <div className="min-w-0">
                  <span className="text-sm text-foreground truncate block">
                    {group.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {elementCount} {elementCount === 1 ? "element" : "elements"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Toggle visibility"
                    onClick={(e) => swapVisibility(e, groupID, group)}
                  >
                    {group.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Link selected elements"
                    onClick={(e) => chainToGroup(e, groupID)}
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Unlink group"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroup(groupID);
                    }}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive"
                    title="Delete group and elements"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroupAndDeleteElements(groupID);
                    }}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => addGroup()}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Empty
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => addGroupFromSelected()}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          From selected
        </Button>
      </div>
    </Panel>
  );
};

export default PanelGroups;
