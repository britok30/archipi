"use client";

import React, { useMemo } from "react";
import polylabel from "polylabel";
import areapolygon from "area-polygon";
import type { Layer as LayerType, Area as AreaType, Scene as SceneType, RuntimeCatalog } from "../../store/types";

const styleText: React.CSSProperties = {
  textAnchor: "middle",
  fontSize: "12px",
  fontFamily: "'Helvetica', 'Arial', sans-serif",
  pointerEvents: "none",
  fontWeight: "bold",
  WebkitTouchCallout: "none", // iOS Safari
  WebkitUserSelect: "none", // Chrome/Safari/Opera
  MozUserSelect: "none", // Firefox
  userSelect: "none",
};

interface AreaProps {
  layer: LayerType;
  area: AreaType;
  scene: SceneType;
  catalog: RuntimeCatalog | null;
}

const calculatePolygonWithHoles = (
  area: AreaType,
  layer: LayerType
): number[][][] => {
  // Outer ring
  const outerRing: number[][] = area.vertices.map((vertexID: string) => {
    const vertex = layer.vertices[vertexID];
    if (vertex) {
      return [vertex.x, vertex.y];
    }
    throw new Error(`Vertex ${vertexID} not found in layer.vertices`);
  });

  // Holes
  const holesRings: number[][][] = area.holes.map((holeID: string) => {
    const holeArea = layer.areas[holeID];
    if (holeArea) {
      const holeRing = holeArea.vertices.map((vertexID: string) => {
        const vertex = layer.vertices[vertexID];
        if (vertex) {
          return [vertex.x, vertex.y];
        }
        throw new Error(`Vertex ${vertexID} not found in layer.vertices`);
      });
      return holeRing;
    }
    throw new Error(`Hole area ${holeID} not found in layer.areas`);
  });

  return [outerRing, ...holesRings];
};

const calculateAreaSize = (area: AreaType, layer: LayerType): number => {
  // Outer ring
  const outerRing: number[][] = area.vertices.map((vertexID: string) => {
    const vertex = layer.vertices[vertexID];
    if (vertex) {
      return [vertex.x, vertex.y];
    }
    throw new Error(`Vertex ${vertexID} not found in layer.vertices`);
  });

  let areaSize = areapolygon(outerRing, false);

  // Subtract hole areas
  area.holes.forEach((holeID: string) => {
    const holeArea = layer.areas[holeID];
    if (holeArea) {
      const holeRing = holeArea.vertices.map((vertexID: string) => {
        const vertex = layer.vertices[vertexID];
        if (vertex) {
          return [vertex.x, vertex.y];
        }
        throw new Error(`Vertex ${vertexID} not found in layer.vertices`);
      });
      areaSize -= areapolygon(holeRing, false);
    }
  });

  return areaSize;
};

export const Area: React.FC<AreaProps> = ({ layer, area, scene, catalog }) => {
  const rendered = useMemo(
    () => catalog?.getElement(area.type)?.render2D?.(area, layer, scene),
    [area, catalog, layer, scene]
  );

  const polygonWithHoles = useMemo(
    () => calculatePolygonWithHoles(area, layer),
    [area, layer]
  );

  const center = useMemo(
    () => polylabel(polygonWithHoles, 1.0),
    [polygonWithHoles]
  );

  const areaSize = useMemo(() => calculateAreaSize(area, layer), [area, layer]);

  return (
    <g
      data-element-root
      data-prototype={area.prototype}
      data-id={area.id}
      data-selected={area.selected ? "true" : "false"}
      data-layer={layer.id}
    >
      {rendered}
      <>
        <text
          x="0"
          y="0"
          transform={`translate(${center[0]} ${center[1]}) scale(1, -1)`}
          style={styleText}
        >
          {area.name}
        </text>
        <text
          x="0"
          y="14"
          transform={`translate(${center[0]} ${center[1]}) scale(1, -1)`}
          style={styleText}
        >
          ({(areaSize / 10000).toFixed(2)} m²)
        </text>
      </>
    </g>
  );
};

export default Area;
