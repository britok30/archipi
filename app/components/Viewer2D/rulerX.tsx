"use client";

import React from "react";
import PropTypes from "prop-types";
import * as SharedStyle from "../../styles/shared-style";

export const RulerX = ({
  unitPixelSize,
  positiveUnitsNumber = 50,
  negativeUnitsNumber = 50,
  zoom,
  mouseX,
  width,
  zeroLeftPosition,
  backgroundColor,
  fontColor,
  markerColor,
}) => {
  let elementW = unitPixelSize * zoom;

  let rulerStyle = {
    backgroundColor: backgroundColor,
    position: "relative",
    width: width,
    height: "100%",
    color: fontColor,
  };

  let markerStyle = {
    position: "absolute",
    left: zeroLeftPosition + mouseX * zoom - 6.5,
    top: 8,
    width: 0,
    height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderTop: "8px solid #fff",
    zIndex: 9001,
  };

  let positiveDomElements = [];

  if (elementW <= 200) {
    for (let x = 0; x < positiveUnitsNumber; x++) {
      positiveDomElements.push(
        <div
          key={x}
          className="inline-block relative border-l border-white pl-[0.2rem] text-[10px] h-full text-white"
          style={{ width: elementW, gridColumn: x + 1, gridRow: 1 }}
        >
          {elementW > 30 ? x * 100 : ""}
        </div>
      );
    }
  } else if (elementW > 200) {
    for (let x = 0; x < positiveUnitsNumber; x++) {
      let val = x * 100;
      positiveDomElements.push(
        <div
          key={x}
          className="inline-block relative border-l border-white pl-[0.2rem] text-[10px] h-full text-white"
          style={{ width: elementW, gridColumn: x + 1, gridRow: 1 }}
        >
          <div className="w-[20%] inline-block m-0 p-0">{val}</div>
          <div className="w-[20%] inline-block m-0 p-0">{val + 1 * 20}</div>
          <div className="w-[20%] inline-block m-0 p-0">{val + 2 * 20}</div>
          <div className="w-[20%] inline-block m-0 p-0">{val + 3 * 20}</div>
          <div className="w-[20%] inline-block m-0 p-0">{val + 4 * 20}</div>
        </div>
      );
    }
  }

  let rulerContainer = {
    grdAutoColumns: `${elementW}px`,
  };

  let positiveRulerContainer = {
    ...rulerContainer,
    width: positiveUnitsNumber * elementW,
    left: zeroLeftPosition,
  };

  let negativeRulerContainer = {
    ...rulerContainer,
    width: negativeUnitsNumber * elementW,
    left: zeroLeftPosition - negativeUnitsNumber * elementW,
  };

  return (
    <div style={rulerStyle}>
      <div id="horizontalMarker" style={markerStyle}></div>
      <div
        className="absolute h-[10px] top-[4px] grid gap-0 grid-rows-[100%]"
        id="negativeRuler"
        style={negativeRulerContainer}
      ></div>
      <div
        className="absolute h-[10px] top-[4px] grid gap-0 grid-rows-[100%]"
        id="positiveRuler"
        style={positiveRulerContainer}
      >
        {positiveDomElements}
      </div>
    </div>
  );
};

RulerX.propTypes = {
  unitPixelSize: PropTypes.number.isRequired,
  positiveUnitsNumber: PropTypes.number,
  negativeUnitsNumber: PropTypes.number,
  zoom: PropTypes.number.isRequired,
  mouseX: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  zeroLeftPosition: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  fontColor: PropTypes.string,
  markerColor: PropTypes.string,
};

RulerX.defaultProps = {
  positiveUnitsNumber: 50,
  negativeUnitsNumber: 50,
  backgroundColor: SharedStyle.PRIMARY_COLOR.main,
  fontColor: SharedStyle.COLORS.white,
  markerColor: SharedStyle.SECONDARY_COLOR.main,
};
