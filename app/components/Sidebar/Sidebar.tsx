"use client";

import React, { useMemo } from "react";
import { usePlannerStore } from "../../store";
import PanelElementEditor from "./PanelElementEditor";
import PanelGroupEditor from "./PanelGroupEditor";
import PanelLayers from "./PanelLayers";
import PanelGuides from "./PanelGuides";
import PanelGroups from "./PanelGroups";
import PanelLayerElements from "./PanelLayerElements";
import {
  MODE_VIEWING_CATALOG,
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_3D_VIEW,
} from "../../store/types";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";

const VISIBLE_MODES = [
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_3D_VIEW,
];

const Sidebar: React.FC = () => {
  const mode = usePlannerStore((state) => state.mode);
  const scene = usePlannerStore((state) => state.scene);

  const isVisible = VISIBLE_MODES.includes(mode);

  const selectedLayerId = scene.selectedLayer;
  const selectedLayer = selectedLayerId ? scene.layers[selectedLayerId] : null;

  const multiselected = useMemo(() => {
    if (!selectedLayer) return false;
    const selected = selectedLayer.selected;
    const linesCount = selected.lines.length;
    const itemsCount = selected.items.length;
    const holesCount = selected.holes.length;
    const areasCount = selected.areas.length;

    return (
      linesCount > 1 ||
      itemsCount > 1 ||
      holesCount > 1 ||
      areasCount > 1 ||
      linesCount + itemsCount + holesCount + areasCount > 1
    );
  }, [selectedLayer]);

  const selectedGroupId = useMemo(() => {
    const groups = scene.groups;
    for (const [groupId, group] of Object.entries(groups)) {
      if (group.selected) {
        return groupId;
      }
    }
    return null;
  }, [scene.groups]);

  if (!isVisible) return null;

  return (
    <ShadcnSidebar
      side="right"
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
      onKeyUp={(event: React.KeyboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
    >
      <SidebarHeader className="bg-sidebar-background border-b border-sidebar-border px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Properties</h2>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar-background text-sidebar-foreground scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <Accordion type="multiple" defaultValue={["layers", "layer-elements"]}>
          <PanelGuides />
          <PanelLayers />
          <PanelLayerElements />
          <PanelGroups />
        </Accordion>

        {!multiselected && <PanelElementEditor />}

        {selectedGroupId && <PanelGroupEditor groupID={selectedGroupId} />}
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;
