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

interface ElementType {
  id: string;
  name: string;
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

const filterElements = (
  elements: Record<string, ElementType>,
  regexp: RegExp,
): Record<string, ElementType> => {
  const result: Record<string, ElementType> = {};
  for (const [key, el] of Object.entries(elements)) {
    if (regexp.test(el.name)) {
      result[key] = el;
    }
  }
  return result;
};

interface ElementSectionProps {
  label: string;
  entries: [string, ElementType][];
  onSelect: (elementId: string) => void;
}

const ElementSection: React.FC<ElementSectionProps> = ({ label, entries, onSelect }) => {
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">({entries.length})</span>
      </div>
      <div className="space-y-0.5">
        {entries.map(([id, element]) => (
          <div
            key={id}
            onClick={() => onSelect(element.id)}
            className={`text-sm truncate cursor-pointer px-2 py-1.5 rounded-md transition duration-200 ease-in-out hover:bg-muted/50 ${
              element.selected ? "bg-primary/10 text-foreground" : "text-foreground"
            }`}
          >
            {element.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const PanelLayerElement: React.FC = () => {
  const mode = usePlannerStore((state) => state.mode);
  const scene = usePlannerStore((state) => state.scene);
  const selectItem = usePlannerStore((state) => state.selectItem);
  const selectLine = usePlannerStore((state) => state.selectLine);
  const selectHole = usePlannerStore((state) => state.selectHole);

  const layers = scene.layers;
  const selectedLayer = scene.selectedLayer;

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

  const matchedElements: ElementsType = useMemo(() => {
    if (matchString === "") return elements;
    const regexp = new RegExp(matchString, "i");
    return {
      lines: filterElements(elements.lines, regexp),
      holes: filterElements(elements.holes, regexp),
      items: filterElements(elements.items, regexp),
    };
  }, [elements, matchString]);

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
              label="Lines"
              entries={lineEntries}
              onSelect={(id) => selectLine(layer.id, id)}
            />
            <ElementSection
              label="Holes"
              entries={holeEntries}
              onSelect={(id) => selectHole(layer.id, id)}
            />
            <ElementSection
              label="Items"
              entries={itemEntries}
              onSelect={(id) => selectItem(layer.id, id)}
            />
          </>
        )}
      </div>
    </Panel>
  );
};

export default PanelLayerElement;
