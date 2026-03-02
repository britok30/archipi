"use client";

import React from "react";
import type { Grid } from "../../../store/types";

interface GridVerticalStreakProps {
  width: number;
  height: number;
  grid: Grid;
}

export const GridVerticalStreak: React.FC<GridVerticalStreakProps> = ({ width, height, grid }) => {
  const properties = grid.properties as { step: number; color?: string; colors?: string[] };
  const step = properties.step;
  const colors: string[] = properties.color ? [properties.color] : (properties.colors || ["#ddd"]);

  const rendered: React.ReactElement[] = [];
  let i = 0;
  for (let x = 0; x <= width; x += step) {
    const color = colors[i % colors.length];
    i++;
    rendered.push(
      <line
        key={x}
        x1={x}
        y1="0"
        x2={x}
        y2={height}
        strokeWidth="1"
        stroke={color}
      />
    );
  }

  return <g>{rendered}</g>;
};
