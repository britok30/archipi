"use client";

import React from "react";

interface OverlayComponentProps {
  width: number;
  height: number;
  state: any; // Replace 'any' with your actual state type if available
}

interface OverlayEntry {
  component: React.ComponentType<OverlayComponentProps>;
}

interface OverlaysProps {
  width: number;
  height: number;
  state: any;
  customOverlays?: OverlayEntry[];
}

const Overlays: React.FC<OverlaysProps> = ({
  width,
  height,
  state,
  customOverlays = [],
}) => {
  return (
    <>
      {customOverlays.map((overlay, index) => {
        const OverlayComponent = overlay.component;
        return (
          <OverlayComponent
            key={index}
            width={width}
            height={height}
            state={state}
          />
        );
      })}
    </>
  );
};

export default Overlays;
