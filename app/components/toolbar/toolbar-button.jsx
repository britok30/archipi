"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import * as SharedStyle from "../../styles/shared-style";

//http://www.cssportal.com/css-tooltip-generator/

const STYLE_TOOLTIP = {
  position: "absolute",
  width: "140px",
  color: SharedStyle.COLORS.white,
  background: SharedStyle.COLORS.black,
  height: "30px",
  lineHeight: "30px",
  textAlign: "center",
  visibility: "visible",
  borderRadius: "6px",
  opacity: "0.8",
  left: "50%",
  transform: "translateX(-50%)", // Centers the tooltip horizontally
  bottom: "100%", // Positions the tooltip above the button
  marginBottom: "10px", // Adds some space between the tooltip and the button
  zIndex: "999",
  fontSize: "12px",
  //http://stackoverflow.com/questions/826782/how-to-disable-text-selection-highlighting-using-css
  WebkitTouchCallout: "none" /* iOS Safari */,
  WebkitUserSelect: "none" /* Chrome/Safari/Opera */,
  MozUserSelect: "none" /* Firefox */,
  MsUserSelect: "none" /* Internet Explorer/Edge */,
  userSelect: "none",
};

const STYLE_TOOLTIP_PIN = {
  position: "absolute",
  bottom: "-8px", // Positions the pin at the bottom of the tooltip
  left: "50%",
  transform: "translateX(-50%)", // Centers the pin horizontally
  width: "0",
  height: "0",
  borderTop: "8px solid #000000", // The arrow now points downwards
  borderLeft: "8px solid transparent",
  borderRight: "8px solid transparent",
};

export default function ToolbarButton(props) {
  const [active, setIsActive] = useState(false);

  return (
    <div
      className="w-[30px] h-[30px] flex items-center justify-center mt-[5px] mx-2 text-xs relative cursor-pointer transition duration-200 ease-in-out"
      onMouseOver={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div
        className="text-white flex flex-col items-center justify-center select-none"
        onClick={props.onClick}
      >
        {props.children}
      </div>

      {active ? (
        <div style={STYLE_TOOLTIP}>
          <span style={STYLE_TOOLTIP_PIN} />
          {props.tooltip}
        </div>
      ) : null}
    </div>
  );
}

ToolbarButton.propTypes = {
  active: PropTypes.bool.isRequired,
  tooltip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
