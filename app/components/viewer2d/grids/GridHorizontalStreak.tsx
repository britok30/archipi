"use client";

import React from "react";
import type { Grid } from "../../../store/types";

interface GridHorizontalStreakProps {
  width: number;
  height: number;
  grid: Grid;
}

export const GridHorizontalStreak: React.FC<GridHorizontalStreakProps> = ({ width, height, grid }) => {
  const properties = grid.properties as { step: number; color?: string; colors?: string[] };
  const step = properties.step;
  const colors: string[] = properties.color ? [properties.color] : (properties.colors || ["#ddd"]);

  const rendered: React.ReactElement[] = [];
  let i = 0;
  for (let y = 0; y <= height; y += step) {
    const color = colors[i % colors.length];
    i++;
    rendered.push(
      <line
        key={y}
        x1="0"
        y1={y}
        x2={width}
        y2={y}
        strokeWidth="1"
        stroke={color}
      />
    );
  }

  return <g>{rendered}</g>;
};
