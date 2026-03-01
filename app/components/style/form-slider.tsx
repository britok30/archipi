"use client";

import React from "react";
import { Range, getTrackBackground } from "react-range";

interface FormSliderProps {
  value: number;
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: unknown;
}

const textContainerStyle: React.CSSProperties = {
  display: "inline-block",
  width: "15%",
  float: "right",
};

// TODO(pg): port this component
export default function FormSlider({ value, onChange, min = 0, max = 100, step = 1 }: FormSliderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ flex: 1, marginRight: "10px" }}>
        <Range
          values={[value]}
          step={step}
          min={min}
          max={max}
          onChange={onChange}
          renderTrack={({ props, children }) => (
            <div {...props} style={{ ...props.style, height: "6px", width: "100%", background: "#ccc", borderRadius: "3px" }}>
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div {...props} key={props.key} style={{ ...props.style, height: "16px", width: "16px", borderRadius: "50%", backgroundColor: "#1FBCD2" }} />
          )}
        />
      </div>
      <div style={textContainerStyle}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange([Number(e.target.value)])}
          style={{ height: "34px", textAlign: "center", width: "100%" }}
        />
      </div>
    </div>
  );
}
