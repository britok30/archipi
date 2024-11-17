import React from "react";

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

export const RulerY: React.FC<RulerYProps> = ({
  unitPixelSize,
  zoom,
  mouseY,
  height,
  zeroTopPosition,
  backgroundColor = "#f0f0f0",
  fontColor = "#ffffff", // Default to white font color
  markerColor = "#000000",
  positiveUnitsNumber = 50,
  negativeUnitsNumber = 50,
}) => {
  const elementH = unitPixelSize * zoom;

  const elementStyle: React.CSSProperties = {
    height: elementH,
    textOrientation: "upright",
    writingMode: "vertical-lr",
    borderBottom: `1px solid white`,
  };

  const elementClassName = `w-[8px] pb-[0.2em] text-[10px] tracking-[-2px] text-right text-white`;

  const insideElementsClassName = `h-[20%] w-full inline-block tracking-[-2px] text-right text-white`;

  const insideElementsStyle: React.CSSProperties = {
    textOrientation: "upright",
    writingMode: "vertical-lr",
  };

  const rulerStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    height: height,
    color: "#fff",
  };

  const rulerClassName = `w-full text-white`;

  const markerStyle: React.CSSProperties = {
    top: zeroTopPosition - mouseY * zoom - 6.5,
    borderLeft: `8px solid white`,
  };

  const markerClassName = `absolute left-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent z-[9001]`;

  const rulerContainerClassName = `absolute w-full grid gap-0 grid-cols-[100%] pl-[5px]`;

  const rulerContainerStyle: React.CSSProperties = {
    gridAutoRows: `${elementH}px`,
  };

  const positiveRulerContainerStyle: React.CSSProperties = {
    ...rulerContainerStyle,
    top: zeroTopPosition - positiveUnitsNumber * elementH,
    height: positiveUnitsNumber * elementH,
  };

  const negativeRulerContainerStyle: React.CSSProperties = {
    ...rulerContainerStyle,
    top: zeroTopPosition + negativeUnitsNumber * elementH,
    height: negativeUnitsNumber * elementH,
  };

  const positiveDomElements: JSX.Element[] = [];

  if (elementH <= 200) {
    for (let x = 1; x <= positiveUnitsNumber; x++) {
      positiveDomElements.push(
        <div
          key={x}
          className={elementClassName}
          style={{ ...elementStyle, gridColumn: 1, gridRow: x }}
        >
          {elementH > 30 ? (positiveUnitsNumber - x) * 100 : ""}
        </div>
      );
    }
  } else {
    for (let x = 1; x <= positiveUnitsNumber; x++) {
      const val = (positiveUnitsNumber - x) * 100;
      positiveDomElements.push(
        <div
          key={x}
          className={elementClassName}
          style={{ ...elementStyle, gridColumn: 1, gridRow: x }}
        >
          <div className={insideElementsClassName} style={insideElementsStyle}>
            {val + 80}
          </div>
          <div className={insideElementsClassName} style={insideElementsStyle}>
            {val + 60}
          </div>
          <div className={insideElementsClassName} style={insideElementsStyle}>
            {val + 40}
          </div>
          <div className={insideElementsClassName} style={insideElementsStyle}>
            {val + 20}
          </div>
          <div className={insideElementsClassName} style={insideElementsStyle}>
            {val}
          </div>
        </div>
      );
    }
  }

  return (
    <div className={rulerClassName} style={rulerStyle}>
      <div
        id="verticalMarker"
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
