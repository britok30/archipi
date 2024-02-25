"use client";

import React from "react";
import PropTypes, { element } from "prop-types";
import * as SharedStyle from "../../styles/shared-style";

export const RulerY = ({
  unitPixelSize,
  zoom,
  zeroTopPosition,
  mouseY,
  positiveUnitsNumber = 50,
  negativeUnitsNumber = 50,
  height,
}) => {
  let elementH = unitPixelSize * zoom;

  let elementStyle = {
    width: "8px",
    borderBottom: "1px solid #fff",
    paddingBottom: "0.2em",
    fontSize: "10px",
    height: elementH,
    textOrientation: "upright",
    writingMode: "vertical-lr",
    textAlign: "right",
  };

  let insideElementsStyle = {
    height: "20%",
    width: "100%",
    textOrientation: "upright",
    writingMode: "vertical-lr",
    display: "inline-block",
    letterSpacing: "-2px",
    textAlign: "right",
  };

  let markerStyle = {
    position: "absolute",
    top: zeroTopPosition - mouseY * zoom - 6.5,
    left: 8,
    width: 0,
    height: 0,
    borderTop: "5px solid transparent",
    borderBottom: "5px solid transparent",
    borderLeft: "8px solid #fff",
    zIndex: 9001,
  };

  let rulerContainer = {
    position: "absolute",
    width: "100%",
    display: "grid",
    gridRowGap: "0",
    gridColumnGap: "0",
    gridTemplateColumns: "100%",
    grdAutoRows: `${elementH}px`,
    paddingLeft: "5px",
  };

  let positiveRulerContainer = {
    ...rulerContainer,
    top: zeroTopPosition - positiveUnitsNumber * elementH,
    height: positiveUnitsNumber * elementH,
  };

  let negativeRulerContainer = {
    ...rulerContainer,
    top: zeroTopPosition + negativeUnitsNumber * elementH,
    height: negativeUnitsNumber * elementH,
  };

  let positiveDomElements = [];

  if (elementH <= 200) {
    for (let x = 1; x <= positiveUnitsNumber; x++) {
      positiveDomElements.push(
        <div key={x} style={{ ...elementStyle, gridColumn: 1, gridRow: x }}>
          {elementH > 30 ? (positiveUnitsNumber - x) * 100 : ""}
        </div>
      );
    }
  } else if (elementH > 200) {
    for (let x = 1; x <= positiveUnitsNumber; x++) {
      let val = (positiveUnitsNumber - x) * 100;
      positiveDomElements.push(
        <div key={x} style={{ ...elementStyle, gridColumn: 1, gridRow: x }}>
          <div style={insideElementsStyle}>{val + 4 * 20}</div>
          <div style={insideElementsStyle}>{val + 3 * 20}</div>
          <div style={insideElementsStyle}>{val + 2 * 20}</div>
          <div style={insideElementsStyle}>{val + 1 * 20}</div>
          <div style={insideElementsStyle}>{val}</div>
        </div>
      );
    }
  }

  return (
    <div
      className="bg-[#292929] text-white w-full"
      style={{
        height: height,
      }}
    >
      <div id="verticalMarker" style={markerStyle}></div>
      <div id="negativeRuler" style={negativeRulerContainer}></div>
      <div id="positiveRuler" style={positiveRulerContainer}>
        {positiveDomElements}
      </div>
    </div>
  );
};

RulerY.propTypes = {
  unitPixelSize: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  mouseY: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  zeroTopPosition: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  fontColor: PropTypes.string,
  markerColor: PropTypes.string,
};

RulerY.defaultProps = {
  positiveUnitsNumber: 50,
  negativeUnitsNumber: 50,
  backgroundColor: SharedStyle.PRIMARY_COLOR.main,
  fontColor: SharedStyle.COLORS.white,
  markerColor: SharedStyle.SECONDARY_COLOR.main,
};
