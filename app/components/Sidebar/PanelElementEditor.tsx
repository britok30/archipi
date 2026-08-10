"use client";

import React from "react";
import Panel from "./Panel";
import ElementEditor from "./ElementEditor";
import { usePlannerStore } from "../../store";
import type { Line, Hole, Item, Area, Layer } from "../../store/types";
import { SlidersHorizontal } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import {
  displayNameFor,
  computeAreaSize,
  formatAreaSize,
} from "../utils/element-display";

type SceneElement = Line | Hole | Item | Area;

const collectionFor = (
  element: SceneElement,
  layer: Layer,
): Record<string, SceneElement> | undefined => {
  switch (element.prototype) {
    case "lines":
      return layer.lines as Record<string, SceneElement>;
    case "holes":
      return layer.holes as Record<string, SceneElement>;
    case "items":
      return layer.items as Record<string, SceneElement>;
    case "areas":
      return layer.areas as Record<string, SceneElement>;
    default:
      return undefined;
  }
};

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

  const panels = selectedElements.map(({ element, layer }) => {
    const friendlyName = displayNameFor(
      element,
      collectionFor(element, layer),
    );
    const subtitle =
      element.prototype === "areas"
        ? formatAreaSize(computeAreaSize(element as Area, layer))
        : undefined;

    return (
      <Panel
        key={element.id}
        name={friendlyName}
        subtitle={subtitle}
        titleAttr={element.name || element.id}
        value={`element-${element.id}`}
        icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
      >
        <div className="py-1">
          <ElementEditor element={element} layer={layer} />
        </div>
      </Panel>
    );
  });

  return (
    <Accordion type="multiple" defaultValue={allElementIds}>
      {panels}
    </Accordion>
  );
};

export default PanelElementEditor;
