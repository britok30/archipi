"use client";

import React, { useContext } from "react";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Eye, EyeOff, Link, Unlink, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  MODE_ROTATING_ITEM,
  MODE_UPLOADING_IMAGE,
  MODE_FITTING_IMAGE,
};

interface PanelGroupsProps {
  mode: string;
  groups: Map<string, any>;
  layers: Map<string, any>;
}

const PanelGroups: React.FC<PanelGroupsProps> = ({ mode, groups, layers }) => {
  const { translator, groupsActions } = useContext(ReactPlannerContext);

  if (!VISIBILITY_MODE[mode]) return null;

  const selectClick = (groupID: string) => groupsActions.selectGroup(groupID);

  const swapVisibility = (e: React.MouseEvent, groupID: string, group: any) => {
    e.stopPropagation();
    const currentVisibility = group.get("visible");
    groupsActions.setGroupProperties(
      groupID,
      Map({ visible: !currentVisibility })
    );
  };

  const chainToGroup = (groupID: string) => {
    layers.forEach((layer) => {
      const layerID = layer.get("id");
      const layerElements = {
        lines: layer.get("lines"),
        items: layer.get("items"),
        holes: layer.get("holes"),
        areas: layer.get("areas"),
      };

      for (let elementPrototype in layerElements) {
        const ElementList = layerElements[elementPrototype];
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
    <Panel name={translator?.t("Groups")} opened={groups.size > 0}>
      <div className="grid grid-cols-6 text-sm text-gray-300">
        <div className="col-span-2">Actions</div>
        <div className="col-span-2">Elements</div>
        <div className="col-span-2">Name</div>
      </div>

      <div className="mb-2">
        {groups
          .entrySeq()
          .map(([groupID, group]) => {
            const isCurrentGroup = group.get("selected");
            const dimension = group.get("elements").reduce((sum, layer) => {
              return (
                sum + layer.reduce((lSum, elProt) => lSum + elProt.size, 0)
              );
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
                    {group.get("visible") ? (
                      <Eye className="w-4 h-4 text-white" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-blue-500" : "text-white"
                    }`}
                    onClick={() => chainToGroup(groupID)}
                  >
                    <Link className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-blue-500" : "text-white"
                    }`}
                    onClick={() => groupsActions.removeGroup(groupID)}
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      isCurrentGroup ? "text-blue-500" : "text-white"
                    }`}
                    onClick={() =>
                      groupsActions.removeGroupAndDeleteElements(groupID)
                    }
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                <div className="col-span-2 flex items-center text-white">
                  {group
                    .get("elements")
                    .reduce((acc: string[], layer) => {
                      layer.forEach((elProt: any) => {
                        if (elProt.size > 0) {
                          acc.push(elProt.size.toString());
                        }
                      });
                      return acc;
                    }, [])
                    .join(", ")}
                </div>

                <div className="col-span-2 flex items-center text-white">
                  {dimension} {group.get("name")}
                </div>
              </div>
            );
          })
          .toArray()}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => groupsActions.addGroup()}>
          <span>New Empty Group</span>
        </Button>

        <Button size="sm" onClick={() => groupsActions.addGroupFromSelected()}>
          <span>New Group From Selected</span>
        </Button>
      </div>
    </Panel>
  );
};

export default PanelGroups;
