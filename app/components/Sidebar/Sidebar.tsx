"use client";

import React from "react";
import { Map as ImmutableMap } from "immutable";
import PanelElementEditor from "./PanelElementEditor";
import PanelGroupEditor from "./PanelGroupEditor";
import PanelLayers from "./PanelLayers";
import PanelGuides from "./PanelGuides";
import PanelGroups from "./PanelGroups";
import PanelLayerElements from "./PanelLayerElements";

import * as constants from "../../utils/constants";
import { StateType } from "@/app/models/models";

interface SidebarProps {
  state: any;
}

const Sidebar: React.FC<SidebarProps> = ({ state }) => {
  const mode: string = state.get("mode");
  let isVisible = true;

  switch (mode) {
    case constants.MODE_VIEWING_CATALOG:
      isVisible = false;
      break;

    case constants.MODE_IDLE:
    case constants.MODE_2D_ZOOM_IN:
    case constants.MODE_2D_ZOOM_OUT:
    case constants.MODE_2D_PAN:
    case constants.MODE_WAITING_DRAWING_LINE:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
    case constants.MODE_DRAGGING_ITEM:
    case constants.MODE_DRAWING_LINE:
    case constants.MODE_DRAWING_HOLE:
    case constants.MODE_DRAWING_ITEM:
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_ROTATING_ITEM:
    case constants.MODE_3D_VIEW:
      isVisible = true;
      break;
    default:
      isVisible = false;
      break;
  }

  if (!isVisible) return null;

  const selectedLayer: string = state.getIn(["scene", "selectedLayer"]);

  // TODO: change in multi-layer check
  const selected = state.getIn([
    "scene",
    "layers",
    selectedLayer,
    "selected",
  ]) as ImmutableMap<string, any>;

  const multiselected =
    selected.get("lines").size > 1 ||
    selected.get("items").size > 1 ||
    selected.get("holes").size > 1 ||
    selected.get("areas").size > 1 ||
    selected.get("lines").size +
      selected.get("items").size +
      selected.get("holes").size +
      selected.get("areas").size >
      1;

  const groups = state.getIn(["scene", "groups"]) as ImmutableMap<
    string,
    ImmutableMap<string, any>
  >;

  const selectedGroup = groups.findEntry((g) => g.get("selected"));

  return (
    <aside
      className="overflow-y-auto h-screen w-[350px] fixed right-0 min-h-screen bg-[#292929] overflow-x-hidden pb-5 scrollbar scrollbar-thumb-zinc-200 scrollbar-track-black"
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
      onKeyUp={(event: React.KeyboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
    >
      {/* PanelGuides */}
      <div style={{ position: "relative" }}>
        <PanelGuides state={state} />
      </div>

      {/* PanelLayers */}
      <div style={{ position: "relative" }}>
        <PanelLayers state={state} />
      </div>

      {/* PanelLayerElements */}
      <div style={{ position: "relative" }}>
        <PanelLayerElements
          mode={state.get("mode")}
          layers={state.getIn(["scene", "layers"])}
          selectedLayer={state.getIn(["scene", "selectedLayer"])}
        />
      </div>

      {/* PanelGroups */}
      <div style={{ position: "relative" }}>
        <PanelGroups
          mode={state.get("mode")}
          groups={state.getIn(["scene", "groups"])}
          layers={state.getIn(["scene", "layers"])}
        />
      </div>

      {/* PanelElementEditor */}
      {!multiselected && (
        <div style={{ position: "relative" }}>
          <PanelElementEditor state={state} />
        </div>
      )}

      {/* PanelGroupEditor */}
      {selectedGroup && (
        <div style={{ position: "relative" }}>
          <PanelGroupEditor
            state={state}
            groupID={selectedGroup ? selectedGroup[0] : null}
          />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
