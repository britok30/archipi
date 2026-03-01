"use client";

import React from "react";
import { GridHorizontalStreak } from "./GridHorizontalStreak";
import { GridVerticalStreak } from "./GridVerticalStreak";
import type { Scene } from "../../../store/types";

interface GridsProps {
  scene: Scene;
}

export const Grids: React.FC<GridsProps> = ({ scene }) => {
  const { width, height, grids } = scene;

  const renderedGrids = Object.entries(grids).map(([gridId, grid]) => {
    switch (grid.type) {
      case "horizontal-streak":
        return (
          <GridHorizontalStreak
            key={gridId}
            width={width}
            height={height}
            grid={grid}
          />
        );

      case "vertical-streak":
        return (
          <GridVerticalStreak
            key={gridId}
            width={width}
            height={height}
            grid={grid}
          />
        );

      default:
        console.warn(`grid ${grid.type} not allowed`);
        return null;
    }
  });

  return <g>{renderedGrids}</g>;
};

export default Grids;
