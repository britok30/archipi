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
} from "../../utils/constants";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Map as ImmutableMap } from "immutable";

interface ElementType {
  id: string;
  name: string;
  selected: boolean;
  // Add other properties as needed
}

interface ElementsType {
  lines: ImmutableMap<string, ElementType>;
  holes: ImmutableMap<string, ElementType>;
  items: ImmutableMap<string, ElementType>;
}

interface LayerType {
  id: string;
  name: string;
  lines: ImmutableMap<string, ElementType>;
  holes: ImmutableMap<string, ElementType>;
  items: ImmutableMap<string, ElementType>;
  // Add other properties if needed
}

interface PanelLayerElementProps {
  mode: string;
  layers: ImmutableMap<string, LayerType>;
  selectedLayer: string;
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

const PanelLayerElement: React.FC<PanelLayerElementProps> = ({
  mode,
  layers,
  selectedLayer,
}) => {
  const { translator, itemsActions, linesActions, holesActions } =
    useContext(ReactPlannerContext);
  const [matchString, setMatchString] = useState<string>("");
  const [elements, setElements] = useState<ElementsType>({
    lines: ImmutableMap<string, ElementType>(),
    holes: ImmutableMap<string, ElementType>(),
    items: ImmutableMap<string, ElementType>(),
  });
  const [matchedElements, setMatchedElements] =
    useState<ElementsType>(elements);

  useEffect(() => {
    const layer = layers.get(selectedLayer) as LayerType;
    if (!layer) return;
    const newElements: ElementsType = {
      lines: layer.lines,
      holes: layer.holes,
      items: layer.items,
    };
    setElements(newElements);
    if (matchString !== "") {
      const regexp = new RegExp(matchString, "i");
      const filterCb = (el: ElementType) => regexp.test(el.name);
      setMatchedElements({
        lines: newElements.lines.filter(filterCb).toMap(),
        holes: newElements.holes.filter(filterCb).toMap(),
        items: newElements.items.filter(filterCb).toMap(),
      });
    } else {
      setMatchedElements(newElements);
    }
  }, [layers, selectedLayer]);

  const matchArray = (text: string) => {
    if (text === "") {
      setMatchString("");
      setMatchedElements(elements);
      return;
    }

    const regexp = new RegExp(text, "i");
    const filterCb = (el: ElementType) => regexp.test(el.name);

    setMatchString(text);
    setMatchedElements({
      lines: elements.lines.filter(filterCb).toMap(),
      holes: elements.holes.filter(filterCb).toMap(),
      items: elements.items.filter(filterCb).toMap(),
    });
  };

  if (!VISIBILITY_MODE.has(mode)) return null;

  const layer = layers.get(selectedLayer) as LayerType;
  if (!layer) return null;

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

        {matchedElements.lines.size ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              {translator.t("Lines")}
            </p>
            {matchedElements.lines
              .entrySeq()
              .map(([lineID, line]) => (
                <Button
                  key={lineID}
                  size="sm"
                  variant={line.selected ? "secondary" : "default"}
                  onClick={() => linesActions.selectLine(layer.id, line.id)}
                  className="mr-3"
                >
                  {line.name}
                </Button>
              ))
              .toArray()}
          </div>
        ) : null}

        {matchedElements.holes.size ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              Holes
            </p>
            {matchedElements.holes
              .entrySeq()
              .map(([holeID, hole]) => (
                <Button
                  key={holeID}
                  size="sm"
                  variant={hole.selected ? "secondary" : "default"}
                  onClick={() => holesActions.selectHole(layer.id, hole.id)}
                  className="mr-3"
                >
                  {hole.name}
                </Button>
              ))
              .toArray()}
          </div>
        ) : null}

        {matchedElements.items.size ? (
          <div>
            <p style={categoryDividerStyle} className="mb-2">
              Items
            </p>
            {matchedElements.items
              .entrySeq()
              .map(([itemID, item]) => (
                <Button
                  key={itemID}
                  size="sm"
                  variant={item.selected ? "secondary" : "default"}
                  onClick={() => itemsActions.selectItem(layer.id, item.id)}
                  className="mr-3"
                >
                  {item.name}
                </Button>
              ))
              .toArray()}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default PanelLayerElement;
