"use client";

import React, { memo, useMemo } from "react";

const RULER_H = 15;

/**
 * Pick "nice" major/minor tick steps so that major ticks are ~targetPx
 * screen-pixels apart at the current zoom. Steps snap to the sequence
 * 1, 2, 5, 10, 20, 50, 100, 200, 500, …
 */
function niceStep(zoom: number, targetPx = 100): { major: number; minor: number } {
  if (zoom <= 0) return { major: 100, minor: 100 };
  const raw = targetPx / zoom;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / mag;
  const major = r < 1.5 ? mag : r < 3.5 ? 2 * mag : r < 7.5 ? 5 * mag : 10 * mag;
  let minor = major / 5;
  if (minor * zoom < 10) minor = major / 2;
  if (minor * zoom < 10) minor = major;
  return { major, minor };
}

interface RulerXProps {
  unitPixelSize: number;
  positiveUnitsNumber?: number;
  negativeUnitsNumber?: number;
  zoom: number;
  mouseX: number;
  width: number;
  zeroLeftPosition: number;
  backgroundColor?: string;
  fontColor?: string;
  markerColor?: string;
}

const RulerXInner: React.FC<RulerXProps> = ({
  zoom,
  mouseX,
  width,
  zeroLeftPosition,
  backgroundColor = "#292929",
}) => {
  const { major, minor } = useMemo(() => niceStep(zoom), [zoom]);

  // Visible range in scene coordinates (only generate ticks for viewport)
  const sceneMin = Math.max(0, -zeroLeftPosition / zoom);
  const sceneMax = (width - zeroLeftPosition) / zoom;

  const { ticksPath, labels } = useMemo(() => {
    const start = Math.floor(sceneMin / minor) * minor;
    const end = Math.ceil(sceneMax / minor) * minor;
    let d = "";
    const lbls: { sx: number; text: string }[] = [];

    for (let val = start; val <= end; val += minor) {
      const rv = Math.round(val * 1000) / 1000;
      const sx = zeroLeftPosition + rv * zoom;
      if (sx < -20 || sx > width + 20) continue;

      const isMajor = Math.abs(rv % major) < 0.001;
      const tickH = isMajor ? 10 : 5;
      d += `M${sx.toFixed(1)} ${RULER_H}V${RULER_H - tickH}`;

      if (isMajor) {
        lbls.push({ sx, text: String(Math.round(rv)) });
      }
    }

    return { ticksPath: d, labels: lbls };
  }, [sceneMin, sceneMax, major, minor, zeroLeftPosition, zoom, width]);

  const markerX = zeroLeftPosition + mouseX * zoom;

  return (
    <svg
      width={width}
      height={RULER_H}
      style={{ backgroundColor, display: "block" }}
    >
      <path
        d={ticksPath}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
        fill="none"
      />
      {labels.map((lbl) => (
        <text
          key={lbl.text}
          x={lbl.sx + 3}
          y={9}
          fill="rgba(255,255,255,0.8)"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          {lbl.text}
        </text>
      ))}
      <polygon
        points={`${markerX - 4},1 ${markerX + 4},1 ${markerX},7`}
        fill="white"
      />
    </svg>
  );
};

export const RulerX = memo(RulerXInner);
