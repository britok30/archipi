"use client";

import React from "react";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { MODE_DRAWING_ITEM, MODE_DRAWING_HOLE } from "../../store/types";
import { GeometryUtils } from "../../utils/export";

export const DrawingPreview: React.FC = () => {
  const { catalog } = useCatalogContext();
  const mode = usePlannerStore((s) => s.mode);
  const drawingSupport = usePlannerStore((s) => s.drawingSupport);
  const scene = usePlannerStore((s) => s.scene);
  const selectedLayer = usePlannerStore((s) => s.scene.selectedLayer);

  if (!catalog || !selectedLayer) return null;

  const layer = scene.layers[selectedLayer];
  if (!layer) return null;

  const type = drawingSupport.type as string | undefined;
  if (!type) return null;

  // Item preview: render at cursor position
  if (mode === MODE_DRAWING_ITEM) {
    const px = drawingSupport.previewX as number | undefined;
    const py = drawingSupport.previewY as number | undefined;
    if (px == null || py == null) return null;

    const catalogElement = catalog.getElement(type);
    if (!catalogElement?.render2D) return null;

    const mockElement = {
      id: "__preview__",
      type,
      name: "preview",
      prototype: "items",
      selected: false,
      rotation: 0,
      properties: buildDefaultProperties(catalogElement),
    };

    const rendered = catalogElement.render2D(mockElement, layer, scene);

    return (
      <g transform={`translate(${px},${py})`} opacity={0.5} style={{ pointerEvents: "none" }}>
        {rendered}
      </g>
    );
  }

  // Hole preview: render snapped to nearest line
  if (mode === MODE_DRAWING_HOLE) {
    const lineId = drawingSupport.previewLineId as string | undefined;
    if (!lineId) return null;

    const offset = (drawingSupport.previewOffset as number) ?? 0.5;
    const x1 = drawingSupport.previewX1 as number;
    const y1 = drawingSupport.previewY1 as number;
    const x2 = drawingSupport.previewX2 as number;
    const y2 = drawingSupport.previewY2 as number;

    const catalogElement = catalog.getElement(type);
    if (!catalogElement?.render2D) return null;

    const mockElement = {
      id: "__preview__",
      type,
      name: "preview",
      prototype: "holes",
      selected: false,
      offset,
      line: lineId,
      properties: buildDefaultProperties(catalogElement),
    };

    const length = GeometryUtils.pointsDistance(x1, y1, x2, y2);
    const angle = GeometryUtils.angleBetweenTwoPointsAndOrigin(x1, y1, x2, y2);
    const startAt = length * offset;

    return (
      <g
        transform={`translate(${x1}, ${y1}) rotate(${angle}, 0, 0)`}
        opacity={0.5}
        style={{ pointerEvents: "none" }}
      >
        <g transform={`translate(${startAt}, 0)`}>
          {catalogElement.render2D(mockElement, layer, scene)}
        </g>
      </g>
    );
  }

  return null;
};

function buildDefaultProperties(
  catalogElement: { properties: Record<string, { defaultValue: unknown }> }
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  if (catalogElement.properties) {
    for (const [key, prop] of Object.entries(catalogElement.properties)) {
      properties[key] = prop.defaultValue;
    }
  }
  return properties;
}
