"use client";

import React, { useContext } from "react";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ElementEditor from "./ElementEditor";
import { usePlannerStore } from "../../store";
import type { Line, Hole, Item, Area, Layer } from "../../store/types";

type SceneElement = Line | Hole | Item | Area;

const PanelElementEditor: React.FC = () => {
  const { translator } = useContext(ReactPlannerContext);
  const scene = usePlannerStore((state) => state.scene);

  const componentRenderer = (element: SceneElement, layer: Layer) => (
    <Panel
      key={element.id}
      name={translator?.t("Properties: [{0}] {1}",
        element.type,
        element.id
      ) ?? `Properties: [${element.type}] ${element.id}`}
      opened={true}
    >
      <div style={{ padding: "5px 15px" }}>
        <ElementEditor element={element} layer={layer} />
      </div>
    </Panel>
  );

  const layerRenderer = (layer: Layer) => {
    const lines = layer.lines || {};
    const holes = layer.holes || {};
    const areas = layer.areas || {};
    const items = layer.items || {};

    const allElements: Record<string, SceneElement> = { ...lines, ...holes, ...areas, ...items };

    return Object.values(allElements)
      .filter((element) => element.selected)
      .map((element) => componentRenderer(element, layer));
  };

  if (!scene.layers) return null;

  return <div>{Object.values(scene.layers).flatMap(layerRenderer)}</div>;
};

export default PanelElementEditor;
