"use client";

import React, { useState, useEffect, useContext } from "react";
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
import { Search } from "lucide-react";
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

const categoryDividerStyle = {
  paddingBottom: "0.5em",
  borderBottom: "1px solid #888",
};

const filterElements = (
  elements: Record<string, ElementType>,
  regexp: RegExp
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
  const [elements, setElements] = useState<ElementsType>({
    lines: {},
    holes: {},
    items: {},
  });
  const [matchedElements, setMatchedElements] =
    useState<ElementsType>(elements);

  useEffect(() => {
    if (!selectedLayer) return;
    const layer = layers[selectedLayer];
    if (!layer) return;
    const newElements: ElementsType = {
      lines: layer.lines || {},
      holes: layer.holes || {},
      items: layer.items || {},
    };
    setElements(newElements);
    if (matchString !== "") {
      const regexp = new RegExp(matchString, "i");
      setMatchedElements({
        lines: filterElements(newElements.lines, regexp),
        holes: filterElements(newElements.holes, regexp),
        items: filterElements(newElements.items, regexp),
      });
    } else {
      setMatchedElements(newElements);
    }
  }, [layers, selectedLayer, matchString]);

  const matchArray = (text: string) => {
    if (text === "") {
      setMatchString("");
      setMatchedElements(elements);
      return;
    }

    const regexp = new RegExp(text, "i");

    setMatchString(text);
    setMatchedElements({
      lines: filterElements(elements.lines, regexp),
      holes: filterElements(elements.holes, regexp),
      items: filterElements(elements.items, regexp),
    });
  };

  if (!VISIBILITY_MODE.has(mode)) return null;
  if (!selectedLayer) return null;

  const layer = layers[selectedLayer];
  if (!layer) return null;

  const lineEntries = Object.entries(matchedElements.lines);
  const holeEntries = Object.entries(matchedElements.holes);
  const itemEntries = Object.entries(matchedElements.items);

  return (
    <Panel name={`Elements on layer ${layer.name}`}>
      <div className="h-auto overflow-y-auto max-h-40 cursor-pointer mb-2 select-none w-full px-3">
        <div className="flex items-center space-x-3 mb-3">
          <Search />
          <Input
            type="text"
            onChange={(e) => {
              matchArray(e.target.value);
            }}
          />
        </div>

        {lineEntries.length ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              {translator?.t("Lines") ?? "Lines"}
            </p>
            {lineEntries.map(([lineID, line]) => (
              <Button
                key={lineID}
                size="sm"
                variant={line.selected ? "secondary" : "default"}
                onClick={() => selectLine(layer.id, line.id)}
                className="mr-3"
              >
                {line.name}
              </Button>
            ))}
          </div>
        ) : null}

        {holeEntries.length ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              Holes
            </p>
            {holeEntries.map(([holeID, hole]) => (
              <Button
                key={holeID}
                size="sm"
                variant={hole.selected ? "secondary" : "default"}
                onClick={() => selectHole(layer.id, hole.id)}
                className="mr-3"
              >
                {hole.name}
              </Button>
            ))}
          </div>
        ) : null}

        {itemEntries.length ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              Items
            </p>
            {itemEntries.map(([itemID, item]) => (
              <Button
                key={itemID}
                size="sm"
                variant={item.selected ? "secondary" : "default"}
                onClick={() => selectItem(layer.id, item.id)}
                className="mr-3"
              >
                {item.name}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default PanelLayerElement;
