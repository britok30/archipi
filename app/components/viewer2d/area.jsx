"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import polylabel from "polylabel";
import areapolygon from "area-polygon";

const styleText = {
  textAnchor: "middle",
  fontSize: "12px",
  fontFamily: "'Helvetica', 'Arial', sans-serif",
  pointerEvents: "none",
  fontWeight: "bold",
  WebkitTouchCallout: "none", // iOS Safari
  WebkitUserSelect: "none", // Chrome/Safari/Opera
  MozUserSelect: "none", // Firefox
  MsUserSelect: "none", // Internet Explorer/Edge
  userSelect: "none",
};

const calculatePolygonWithHoles = (area, layer) => {
  let polygonWithHoles = area.vertices.toArray().map((vertexID) => {
    const { x, y } = layer.vertices.get(vertexID);
    return [x, y];
  });

  area.holes.forEach((holeID) => {
    const holePolygon = layer.areas
      .get(holeID)
      .vertices.toArray()
      .map((vertexID) => {
        const { x, y } = layer.vertices.get(vertexID);
        return [x, y];
      });

    polygonWithHoles = polygonWithHoles.concat(holePolygon.reverse());
  });

  return polygonWithHoles;
};

const calculateAreaSize = (area, layer) => {
  const polygon = area.vertices.toArray().map((vertexID) => {
    const { x, y } = layer.vertices.get(vertexID);
    return [x, y];
  });

  let areaSize = areapolygon(polygon, false);

  area.holes.forEach((areaID) => {
    const hole = layer.areas.get(areaID);
    const holePolygon = hole.vertices.toArray().map((vertexID) => {
      const { x, y } = layer.vertices.get(vertexID);
      return [x, y];
    });
    areaSize -= areapolygon(holePolygon, false);
  });

  return areaSize;
};

export const Area = ({ layer, area, catalog }) => {
  const rendered = useMemo(
    () => catalog.getElement(area.type).render2D(area, layer),
    [area, catalog, layer]
  );
  const polygonWithHoles = useMemo(
    () => calculatePolygonWithHoles(area, layer),
    [area, layer]
  );
  const center = useMemo(
    () => polylabel([polygonWithHoles], 1.0),
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

Area.propTypes = {
  area: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired,
};
