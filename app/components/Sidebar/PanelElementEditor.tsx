"use client";

import React from "react";
import Panel from "./Panel";
import ElementEditor from "./ElementEditor";
import { usePlannerStore } from "../../store";
import type { Line, Hole, Item, Area, Layer } from "../../store/types";
import { SlidersHorizontal } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

type SceneElement = Line | Hole | Item | Area;

const PanelElementEditor: React.FC = () => {
  const scene = usePlannerStore((state) => state.scene);

  const selectedElements: { element: SceneElement; layer: Layer }[] = [];

  if (scene.layers) {
    for (const layer of Object.values(scene.layers)) {
      const allElements: Record<string, SceneElement> = {
        ...(layer.lines || {}),
        ...(layer.holes || {}),
        ...(layer.areas || {}),
        ...(layer.items || {}),
      };
      for (const element of Object.values(allElements)) {
        if (element.selected) {
          selectedElements.push({ element, layer });
        }
      }
    }
  }

  if (selectedElements.length === 0) return null;

  const allElementIds = selectedElements.map(({ element }) => `element-${element.id}`);

  const panels = selectedElements.map(({ element, layer }) => (
    <Panel
      key={element.id}
      name={`Properties: [${element.type}] ${element.id}`}
      value={`element-${element.id}`}
      icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
    >
      <div className="py-1 px-2">
        <ElementEditor element={element} layer={layer} />
      </div>
    </Panel>
  ));

  return (
    <Accordion type="multiple" defaultValue={allElementIds}>
      {panels}
    </Accordion>
  );
};

export default PanelElementEditor;
