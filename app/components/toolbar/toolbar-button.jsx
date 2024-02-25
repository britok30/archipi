"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import * as SharedStyle from "../../styles/shared-style";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function ToolbarButton({ active, tooltip, children, onClick }) {
  return (
    <div className="w-[30px] h-[30px] flex items-center justify-center text-xs relative cursor-pointer transition duration-200 ease-in-out">
      <Tippy content={tooltip}>
        <div
          className="text-white flex flex-col items-center justify-center select-none"
          onClick={onClick}
        >
          {children}
        </div>
      </Tippy>
    </div>
  );
}

ToolbarButton.propTypes = {
  active: PropTypes.bool.isRequired,
  tooltip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
