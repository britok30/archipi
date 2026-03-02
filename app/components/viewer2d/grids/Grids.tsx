"use client";

import React, { memo, useMemo } from "react";
import { usePlannerStore } from "../../../store";
import type { Scene } from "../../../store/types";

interface GridsProps {
  scene: Scene;
}

/**
 * Renders a 2D grid using nested SVG <pattern> elements instead of
 * individual <line> elements. This reduces DOM nodes from ~250 to ~5
 * and enables zoom-adaptive density (minor lines fade when too dense).
 */
const GridsInner: React.FC<GridsProps> = ({ scene }) => {
  const { width, height, grids } = scene;
  const zoom = usePlannerStore((state) => state.zoom) || 1;

  const gridConfig = useMemo(() => {
    const firstGrid = Object.values(grids)[0];
    const props = firstGrid?.properties as {
      step?: number;
      colors?: string[];
      color?: string;
    } | undefined;

    const step = props?.step ?? 20;
    const colors = props?.colors ?? [props?.color ?? "#808080"];
    const majorColor = colors[0] ?? "#808080";
    const minorColor = colors[1] ?? "#ddd";
    const majorEvery = colors.length || 5;

    return { step, majorColor, minorColor, majorStep: step * majorEvery };
  }, [grids]);

  const { step, majorColor, minorColor, majorStep } = gridConfig;

  // Fade minor lines when they occupy < 8 screen pixels apart
  const minorScreenPx = step * zoom;
  const minorOpacity = Math.max(0, Math.min(1, (minorScreenPx - 4) / 8));

  return (
    <g>
      <defs>
        <pattern
          id="grid-minor"
          width={step}
          height={step}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${step} 0 L 0 0 0 ${step}`}
            fill="none"
            stroke={minorColor}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern
          id="grid-major"
          width={majorStep}
          height={majorStep}
          patternUnits="userSpaceOnUse"
        >
          {minorOpacity > 0 && (
            <rect
              width={majorStep}
              height={majorStep}
              fill="url(#grid-minor)"
              opacity={minorOpacity}
            />
          )}
          <path
            d={`M ${majorStep} 0 L 0 0 0 ${majorStep}`}
            fill="none"
            stroke={majorColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#grid-major)" />
    </g>
  );
};

export const Grids = memo(GridsInner);
export default Grids;
