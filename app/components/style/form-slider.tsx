"use client";

import React from "react";
import { Range } from "react-range";

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
            <div {...props} style={{ ...props.style, height: "6px", width: "100%", background: "hsl(220 13% 18%)", borderRadius: "3px" }}>
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div {...props} key={props.key} style={{ ...props.style, height: "16px", width: "16px", borderRadius: "50%", backgroundColor: "hsl(217 91% 60%)" }} />
          )}
        />
      </div>
      <div style={textContainerStyle}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange([Number(e.target.value)])}
          className="h-[34px] text-center w-full bg-secondary text-foreground border border-border rounded-md outline-none"
        />
      </div>
    </div>
  );
}
