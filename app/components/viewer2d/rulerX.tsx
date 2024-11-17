import React from "react";

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

export const RulerX: React.FC<RulerXProps> = ({
  unitPixelSize,
  positiveUnitsNumber = 50,
  negativeUnitsNumber = 50,
  zoom,
  mouseX,
  width,
  zeroLeftPosition,
  backgroundColor = "#f0f0f0",
  fontColor = "#ffffff", // Default to white font color
  markerColor = "#000000",
}) => {
  const elementW = unitPixelSize * zoom;

  const elementStyle: React.CSSProperties = {
    width: elementW,
    borderLeft: `1px solid white`,
  };

  const elementClassName = `inline-block relative pl-[0.2em] text-[10px] h-full text-white`;

  const insideElementsClassName = `w-[20%] inline-block m-0 p-0 text-white`;

  const rulerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    width: width,
  };

  const rulerClassName = `relative h-full text-white`;

  const markerStyle: React.CSSProperties = {
    left: zeroLeftPosition + mouseX * zoom - 6.5,
    borderTop: `8px solid white`,
  };

  const markerClassName = `absolute top-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent z-[9001]`;

  const rulerContainerClassName = `absolute h-[10px] top-1 grid grid-rows-[100%] gap-0`;

  const positiveRulerContainerStyle: React.CSSProperties = {
    width: positiveUnitsNumber * elementW,
    left: zeroLeftPosition,
    gridAutoColumns: `${elementW}px`,
  };

  const negativeRulerContainerStyle: React.CSSProperties = {
    width: negativeUnitsNumber * elementW,
    left: zeroLeftPosition - negativeUnitsNumber * elementW,
    gridAutoColumns: `${elementW}px`,
  };

  const positiveDomElements: JSX.Element[] = [];

  if (elementW <= 200) {
    for (let x = 0; x < positiveUnitsNumber; x++) {
      positiveDomElements.push(
        <div
          key={x}
          className={elementClassName}
          style={{ ...elementStyle, gridColumn: x + 1, gridRow: 1 }}
        >
          {elementW > 30 ? x * 100 : ""}
        </div>
      );
    }
  } else {
    for (let x = 0; x < positiveUnitsNumber; x++) {
      const val = x * 100;
      positiveDomElements.push(
        <div
          key={x}
          className={elementClassName}
          style={{ ...elementStyle, gridColumn: x + 1, gridRow: 1 }}
        >
          <div className={insideElementsClassName}>{val}</div>
          <div className={insideElementsClassName}>{val + 20}</div>
          <div className={insideElementsClassName}>{val + 40}</div>
          <div className={insideElementsClassName}>{val + 60}</div>
          <div className={insideElementsClassName}>{val + 80}</div>
        </div>
      );
    }
  }

  return (
    <div className={rulerClassName} style={rulerStyle}>
      <div
        id="horizontalMarker"
        className={markerClassName}
        style={markerStyle}
      ></div>
      <div
        id="negativeRuler"
        className={rulerContainerClassName}
        style={negativeRulerContainerStyle}
      ></div>
      <div
        id="positiveRuler"
        className={rulerContainerClassName}
        style={positiveRulerContainerStyle}
      >
        {positiveDomElements}
      </div>
    </div>
  );
};
