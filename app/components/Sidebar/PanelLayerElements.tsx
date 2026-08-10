"use client";

import React, { useState, useMemo } from "react";
import Panel from "./Panel";
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
import { Boxes, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePlannerStore } from "../../store";
import { buildDisplayNames } from "../utils/element-display";

interface ElementType {
  id: string;
  name: string;
  type?: string;
  selected: boolean;
}

interface ElementsType {
  lines: Record<string, ElementType>;
  holes: Record<string, ElementType>;
  items: Record<string, ElementType>;
}

const VISIBILITY_MODE = new Set([
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
]);

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const filterElements = (
  elements: Record<string, ElementType>,
  displayNames: Record<string, string>,
  regexp: RegExp,
): Record<string, ElementType> => {
  const result: Record<string, ElementType> = {};
  for (const [key, el] of Object.entries(elements)) {
    if (regexp.test(el.name) || regexp.test(displayNames[key] ?? "")) {
      result[key] = el;
    }
  }
  return result;
};

interface ElementSectionProps {
  label: string;
  entries: [string, ElementType][];
  displayNames: Record<string, string>;
  onSelect: (elementId: string) => void;
}

const ElementSection: React.FC<ElementSectionProps> = ({
  label,
  entries,
  displayNames,
  onSelect,
}) => {
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 px-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground/70">
          {entries.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {entries.map(([id, element]) => (
          <div
            key={id}
            onClick={() => onSelect(element.id)}
            title={element.name}
            className={`group flex items-center gap-2 text-sm cursor-pointer px-2 py-1.5 rounded-md transition duration-200 ease-in-out hover:bg-muted/50 ${
              element.selected
                ? "bg-primary/10 text-foreground"
                : "text-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                element.selected ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-hidden
            />
            <span className="truncate">{displayNames[id] ?? element.name}</span>
            {/* Raw internal name for power users (and accessible search) */}
            <span className="sr-only">{element.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PanelLayerElement: React.FC = () => {
  const mode = usePlannerStore((state) => state.mode);
  const layers = usePlannerStore((state) => state.scene.layers);
  const selectedLayer = usePlannerStore((state) => state.scene.selectedLayer);
  const selectItem = usePlannerStore((state) => state.selectItem);
  const selectLine = usePlannerStore((state) => state.selectLine);
  const selectHole = usePlannerStore((state) => state.selectHole);

  const [matchString, setMatchString] = useState<string>("");

  const elements: ElementsType = useMemo(() => {
    if (!selectedLayer) return { lines: {}, holes: {}, items: {} };
    const layer = layers[selectedLayer];
    if (!layer) return { lines: {}, holes: {}, items: {} };
    return {
      lines: layer.lines || {},
      holes: layer.holes || {},
      items: layer.items || {},
    };
  }, [layers, selectedLayer]);

  // Friendly display names ("Wall 1", "Chair 2") computed from the full
  // collections so ordinals stay stable while filtering.
  const displayNames = useMemo(
    () => ({
      lines: buildDisplayNames(elements.lines),
      holes: buildDisplayNames(elements.holes),
      items: buildDisplayNames(elements.items),
    }),
    [elements],
  );

  const matchedElements: ElementsType = useMemo(() => {
    if (matchString === "") return elements;
    const regexp = new RegExp(escapeRegex(matchString), "i");
    return {
      lines: filterElements(elements.lines, displayNames.lines, regexp),
      holes: filterElements(elements.holes, displayNames.holes, regexp),
      items: filterElements(elements.items, displayNames.items, regexp),
    };
  }, [elements, displayNames, matchString]);

  if (!VISIBILITY_MODE.has(mode)) return null;
  if (!selectedLayer) return null;

  const layer = layers[selectedLayer];
  if (!layer) return null;

  const lineEntries = Object.entries(matchedElements.lines);
  const holeEntries = Object.entries(matchedElements.holes);
  const itemEntries = Object.entries(matchedElements.items);
  const totalCount = lineEntries.length + holeEntries.length + itemEntries.length;

  return (
    <Panel
      name={`Elements on ${layer.name}`}
      value="layer-elements"
      icon={<Boxes className="w-3.5 h-3.5" />}
    >
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter elements..."
          value={matchString}
          onChange={(e) => setMatchString(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="max-h-64 overflow-y-auto select-none space-y-3 scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {matchString ? "No matching elements" : "No elements on this layer"}
          </p>
        ) : (
          <>
            <ElementSection
              label="Walls"
              entries={lineEntries}
              displayNames={displayNames.lines}
              onSelect={(id) => selectLine(layer.id, id)}
            />
            <ElementSection
              label="Doors & Windows"
              entries={holeEntries}
              displayNames={displayNames.holes}
              onSelect={(id) => selectHole(layer.id, id)}
            />
            <ElementSection
              label="Furniture"
              entries={itemEntries}
              displayNames={displayNames.items}
              onSelect={(id) => selectItem(layer.id, id)}
            />
          </>
        )}
      </div>
    </Panel>
  );
};

export default PanelLayerElement;
