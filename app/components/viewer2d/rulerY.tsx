"use client";

import React, { memo, useMemo } from "react";

const RULER_W = 15;

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

interface RulerYProps {
  unitPixelSize: number;
  zoom: number;
  mouseY: number;
  height: number;
  zeroTopPosition: number;
  backgroundColor?: string;
  fontColor?: string;
  markerColor?: string;
  positiveUnitsNumber?: number;
  negativeUnitsNumber?: number;
}

const RulerYInner: React.FC<RulerYProps> = ({
  zoom,
  mouseY,
  height,
  zeroTopPosition,
  backgroundColor = "#292929",
}) => {
  const { major, minor } = useMemo(() => niceStep(zoom), [zoom]);

  // Visible range in scene coordinates
  // screenY = zeroTopPosition - sceneY * zoom
  // sceneY = (zeroTopPosition - screenY) / zoom
  const sceneMin = Math.max(0, (zeroTopPosition - height) / zoom);
  const sceneMax = Math.max(0, zeroTopPosition / zoom);

  const { ticksPath, labels } = useMemo(() => {
    const start = Math.floor(sceneMin / minor) * minor;
    const end = Math.ceil(sceneMax / minor) * minor;
    let d = "";
    const lbls: { sy: number; text: string }[] = [];

    for (let val = start; val <= end; val += minor) {
      const rv = Math.round(val * 1000) / 1000;
      const sy = zeroTopPosition - rv * zoom;
      if (sy < -20 || sy > height + 20) continue;

      const isMajor = Math.abs(rv % major) < 0.001;
      const tickW = isMajor ? 10 : 5;
      d += `M${RULER_W} ${sy.toFixed(1)}H${RULER_W - tickW}`;

      if (isMajor) {
        lbls.push({ sy, text: String(Math.round(rv)) });
      }
    }

    return { ticksPath: d, labels: lbls };
  }, [sceneMin, sceneMax, major, minor, zeroTopPosition, zoom, height]);

  const markerY = zeroTopPosition - mouseY * zoom;

  return (
    <svg
      width={RULER_W}
      height={height}
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
          x={4}
          y={lbl.sy - 3}
          fill="rgba(255,255,255,0.8)"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          transform={`rotate(-90, 4, ${lbl.sy - 3})`}
        >
          {lbl.text}
        </text>
      ))}
      <polygon
        points={`1,${markerY - 4} 1,${markerY + 4} 7,${markerY}`}
        fill="white"
      />
    </svg>
  );
};

export const RulerY = memo(RulerYInner);
