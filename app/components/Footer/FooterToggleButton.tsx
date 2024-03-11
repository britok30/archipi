"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const FooterToggleButton = ({
  toggleOn,
  toggleOff,
  text,
  toggleState = false,
  title,
}) => {
  const [over, setOver] = useState(false);
  const [active, setActive] = useState(toggleState);

  const toggleOver = useCallback(() => setOver(true), []);
  const toggleOut = useCallback(() => setOver(false), []);

  const toggle = useCallback(() => {
    setActive((prevState) => {
      const isActive = !prevState;
      if (isActive) {
        toggleOn();
      } else {
        toggleOff();
      }
      return isActive;
    });
  }, [toggleOn, toggleOff]);

  useEffect(() => {
    setActive(toggleState);
  }, [toggleState]);

  return (
    <div
      className={classNames(
        "w-[5.5rem] text-white text-center cursor-pointer select-none border border-transparent mt-[-1px] mx-[5px] mb-0 rounded-md inline-block transition duration-200 ease-in-out",
        { "bg-[#292929] border-white": over || active }
      )}
      onMouseOver={toggleOver}
      onMouseOut={toggleOut}
      onClick={toggle}
      title={title}
    >
      {text}
    </div>
  );
};

FooterToggleButton.propTypes = {
  toggleOn: PropTypes.func.isRequired,
  toggleOff: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  toggleState: PropTypes.bool,
  title: PropTypes.string,
};

export default FooterToggleButton;
