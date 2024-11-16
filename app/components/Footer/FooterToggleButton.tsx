"use client";

import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FooterToggleButtonProps {
  toggleOn: () => void;
  toggleOff: () => void;
  text: string;
  toggleState?: boolean;
  title?: string;
}

const FooterToggleButton: React.FC<FooterToggleButtonProps> = ({
  toggleOn,
  toggleOff,
  text,
  toggleState = false,
  title,
}) => {
  const [over, setOver] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(toggleState);

  const toggleOver = useCallback(() => setOver(true), []);
  const toggleOut = useCallback(() => setOver(false), []);

  const toggle = useCallback(() => {
    const isActive = !active;
    setActive(isActive);
    if (isActive) {
      toggleOn();
    } else {
      toggleOff();
    }
  }, [active, toggleOn, toggleOff]);

  useEffect(() => {
    setActive(toggleState);
  }, [toggleState]);

  return (
    <Badge
      className={classNames(
        "w-[5.5rem] text-xs !p-0 text-white text-center cursor-pointer select-none border border-transparent mt-[-1px] mx-[5px] mb-0 rounded-md inline-block transition duration-200 ease-in-out",
        { "bg-[#292929] border-white": over || active }
      )}
      onMouseOver={toggleOver}
      onMouseOut={toggleOut}
      onClick={toggle}
      title={title}
    >
      {text}
    </Badge>
  );
};

export default FooterToggleButton;
