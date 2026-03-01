"use client";

import React, { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import classNames from "classnames";

interface PanelProps {
  name: string;
  headComponents?: React.ReactNode[];
  children?: React.ReactNode;
  opened?: boolean;
}

const Panel: React.FC<PanelProps> = ({
  name,
  headComponents,
  children,
  opened: initialOpened = false,
}) => {
  const [opened, setOpened] = useState(initialOpened);

  const toggleOpen = () => setOpened(!opened);

  return (
    <div className=" border-white border-b select-none bg-black">
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

export default Panel;
