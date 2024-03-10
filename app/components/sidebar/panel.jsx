"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import classNames from "classnames";

const Panel = ({
  name,
  headComponents,
  children,
  opened: initialOpened = false,
}) => {
  const [opened, setOpened] = useState(initialOpened);

  const toggleOpen = () => setOpened(!opened);

  return (
    <div className=" border-white borxder-b select-none bg-black">
      <h3
        className={classNames(
          "text-sm text-white p-3 appearance-none hover:text-gray-500 transition duration-200 ease-in-out",
          {
            "cursor-default": opened,
            "cursor-pointer": !opened,
          }
        )}
        onClick={toggleOpen}
      >
        {name}
        {headComponents}
        {opened ? (
          <FaAngleUp className="float-right" />
        ) : (
          <FaAngleDown className="float-right" />
        )}
      </h3>

      <div
        className={classNames(
          "text-xs border py-3 px-3 border-gray-800 p-0 bg-primary-alt text-shadow transition duration-200 ease-in-out",
          {
            block: opened,
            hidden: !opened,
          }
        )}
      >
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  name: PropTypes.string.isRequired,
  headComponents: PropTypes.array,
  opened: PropTypes.bool,
};

export default Panel;
