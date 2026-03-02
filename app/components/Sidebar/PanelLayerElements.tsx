"use client";

import React, { useState, useMemo, useContext } from "react";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
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
import { Button } from "@/components/ui/button";
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

const PanelLayerElement: React.FC = () => {
  const { translator } = useContext(ReactPlannerContext);
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

  return (
    <Panel
      name={`Elements on layer ${layer.name}`}
      value="layer-elements"
      icon={<Boxes className="w-3.5 h-3.5" />}
    >
      <div className="h-auto overflow-y-auto max-h-40 cursor-pointer mb-2 select-none w-full px-3">
        <div className="flex items-center space-x-3 mb-3">
          <Search />
          <Input
            type="text"
            onChange={(e) => {
              setMatchString(e.target.value);
            }}
          />
        </div>

        {lineEntries.length ? (
          <div>
            <p className="pb-2 border-b border-border/40 text-muted-foreground mb-2">
              {translator?.t("Lines") ?? "Lines"}
            </p>
            <div className="gap-2 grid grid-cols-2 items-center">
              {lineEntries.map(([lineID, line]) => (
                <Button
                  key={lineID}
                  size="sm"
                  variant={line.selected ? "default" : "secondary"}
                  onClick={() => selectLine(layer.id, line.id)}
                  className={`${line.selected ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {line.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {holeEntries.length ? (
          <div>
            <p className="pb-2 border-b border-border/40 text-muted-foreground mb-2">
              Holes
            </p>
            <div className="gap-2 grid grid-cols-2 items-center">
              {holeEntries.map(([holeID, hole]) => (
                <Button
                  key={holeID}
                  size="sm"
                  variant={hole.selected ? "default" : "secondary"}
                  onClick={() => selectHole(layer.id, hole.id)}
                  className={`mr-3 ${hole.selected ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {hole.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {itemEntries.length ? (
          <div>
            <p className="pb-2 border-b border-border/40 text-muted-foreground mb-2">
              Items
            </p>
            <div className="gap-2 grid grid-cols-2 items-center">
              {itemEntries.map(([itemID, item]) => (
                <Button
                  key={itemID}
                  size="sm"
                  variant={item.selected ? "default" : "secondary"}
                  onClick={() => selectItem(layer.id, item.id)}
                  className={`mr-3 ${item.selected ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default PanelLayerElement;
