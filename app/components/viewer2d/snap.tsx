"use client";

import React from "react";
import * as Geometry from "../../utils/geometry";

interface PointSnap {
  type: "point";
  x: number;
  y: number;
}

interface LineSnap {
  type: "line";
  a: number;
  b: number;
  c: number;
  x: number;
  y: number;
}

interface LineSegmentSnap {
  type: "line-segment";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

type Snap = PointSnap | LineSnap | LineSegmentSnap | { type: string };

interface ActiveDrawingHelperProps {
  snap: Snap;
  width: number;
  height: number;
}

const STYLE: React.CSSProperties = {
  stroke: "#D32F2F",
  strokeWidth: "1px",
};

export const ActiveDrawingHelper: React.FC<ActiveDrawingHelperProps> = ({ snap, width, height }) => {
  switch (snap.type) {
    case "point": {
      const pointSnap = snap as PointSnap;
      return (
        <g transform={`translate(${pointSnap.x} ${pointSnap.y})`}>
          <line x1="0" y1="-70" x2="0" y2="70" style={STYLE} />
          <line x1="-70" y1="0" x2="70" y2="0" style={STYLE} />
        </g>
      );
    }

    case "line": {
      const lineSnap = snap as LineSnap;
      let h0 = Geometry.horizontalLine(0);
      let h1 = Geometry.horizontalLine(height);
      let pointH0 = Geometry.twoLinesIntersection(
        lineSnap.a,
        lineSnap.b,
        lineSnap.c,
        h0.a,
        h0.b,
        h0.c
      );
      let pointH1 = Geometry.twoLinesIntersection(
        lineSnap.a,
        lineSnap.b,
        lineSnap.c,
        h1.a,
        h1.b,
        h1.c
      );

      let v0 = Geometry.verticalLine(0);
      let v1 = Geometry.verticalLine(width);
      let pointV0 = Geometry.twoLinesIntersection(
        lineSnap.a,
        lineSnap.b,
        lineSnap.c,
        v0.a,
        v0.b,
        v0.c
      );
      let pointV1 = Geometry.twoLinesIntersection(
        lineSnap.a,
        lineSnap.b,
        lineSnap.c,
        v1.a,
        v1.b,
        v1.c
      );

      if (pointH0 && pointH1)
        return (
          <line
            x1={pointH0.x}
            y1={pointH0.y}
            x2={pointH1.x}
            y2={pointH1.y}
            style={STYLE}
          />
        );
      if (pointV0 && pointV1)
        return (
          <line
            x1={pointV0.x}
            y1={pointV0.y}
            x2={pointV1.x}
            y2={pointV1.y}
            style={STYLE}
          />
        );
      return null;
    }

    case "line-segment": {
      const segSnap = snap as LineSegmentSnap;
      return (
        <line
          x1={segSnap.x1}
          y1={segSnap.y1}
          x2={segSnap.x2}
          y2={segSnap.y2}
          style={STYLE}
        />
      );
    }

    default:
      return null;
  }
};
