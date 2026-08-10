"use client";

import React, { useMemo } from "react";
import polylabel from "polylabel";
import areapolygon from "area-polygon";
import type { Layer as LayerType, Area as AreaType, Scene as SceneType, RuntimeCatalog } from "../../store/types";

const styleText: React.CSSProperties = {
  textAnchor: "middle",
  fontSize: "12px",
  fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  pointerEvents: "none",
  fontWeight: 500,
  fill: "#7C8494",
  WebkitTouchCallout: "none", // iOS Safari
  WebkitUserSelect: "none", // Chrome/Safari/Opera
  MozUserSelect: "none", // Firefox
  userSelect: "none",
};

// Hide the size label for slivers where it would only add noise (< 1 m²)
const MIN_LABELED_AREA_CM2 = 10000;

interface AreaProps {
  layer: LayerType;
  area: AreaType;
  scene: SceneType;
  catalog: RuntimeCatalog | null;
}

// Skips vertex IDs that no longer exist in layer.vertices.
const ringFromVertexIDs = (
  vertexIDs: string[],
  layer: LayerType
): number[][] => {
  const ring: number[][] = [];
  for (const vertexID of vertexIDs) {
    const vertex = layer.vertices[vertexID];
    if (vertex) ring.push([vertex.x, vertex.y]);
  }
  return ring;
};

const calculatePolygonWithHoles = (
  area: AreaType,
  layer: LayerType
): number[][][] => {
  const outerRing = ringFromVertexIDs(area.vertices, layer);

  // Skip hole areas that reference deleted areas
  const holesRings: number[][][] = [];
  for (const holeID of area.holes) {
    const holeArea = layer.areas[holeID];
    if (!holeArea) continue;
    holesRings.push(ringFromVertexIDs(holeArea.vertices, layer));
  }

  return [outerRing, ...holesRings];
};

const calculateAreaSize = (area: AreaType, layer: LayerType): number => {
  const outerRing = ringFromVertexIDs(area.vertices, layer);
  if (outerRing.length < 3) return 0;

  let areaSize = areapolygon(outerRing, false);

  // Subtract hole areas (skipping deleted ones)
  area.holes.forEach((holeID: string) => {
    const holeArea = layer.areas[holeID];
    if (holeArea) {
      const holeRing = ringFromVertexIDs(holeArea.vertices, layer);
      if (holeRing.length >= 3) {
        areaSize -= areapolygon(holeRing, false);
      }
    }
  });

  return areaSize;
};

const AreaComponent: React.FC<AreaProps> = ({ layer, area, scene, catalog }) => {
  const rendered = useMemo(() => {
    const catalogElement =
      catalog?.hasElement(area.type) ? catalog.getElement(area.type) : null;
    return catalogElement?.render2D?.(area, layer, scene);
  }, [area, catalog, layer, scene]);

  const polygonWithHoles = useMemo(
    () => calculatePolygonWithHoles(area, layer),
    [area, layer]
  );

  const hasValidOuterRing = polygonWithHoles[0].length >= 3;

  const center = useMemo(
    () => (hasValidOuterRing ? polylabel(polygonWithHoles, 1.0) : [0, 0]),
    [polygonWithHoles, hasValidOuterRing]
  );

  const areaSize = useMemo(() => calculateAreaSize(area, layer), [area, layer]);

  if (!hasValidOuterRing) return null;

  return (
    <g
      data-element-root
      data-prototype={area.prototype}
      data-id={area.id}
      data-selected={area.selected ? "true" : "false"}
      data-layer={layer.id}
    >
      {rendered}
      {areaSize >= MIN_LABELED_AREA_CM2 && (
        <text
          x="0"
          y="4"
          transform={`translate(${center[0]} ${center[1]}) scale(1, -1)`}
          style={styleText}
        >
          {(areaSize / 10000).toFixed(2)} m²
        </text>
      )}
    </g>
  );
};

export const Area = React.memo(AreaComponent);

export default Area;
