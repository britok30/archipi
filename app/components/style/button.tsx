"use client";

import React, { useState } from 'react';
import * as SharedStyle from '../../styles/shared-style';

type ButtonSize = 'large' | 'normal' | 'small';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  style?: React.CSSProperties;
  styleHover?: React.CSSProperties;
  size?: ButtonSize;
  children?: React.ReactNode;
}

const BASE_STYLE: React.CSSProperties = {
  display: "inline-block",
  fontWeight: "400",
  lineHeight: "1.25",
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  cursor: "pointer",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
  padding: "5px 14px",
  fontSize: "14px",
  color: SharedStyle.COLORS.black,
  transition: "background-color 175ms ease, border 175ms ease",
  outline: "none",
  borderRadius: "2px",
  borderWidth: "1px",
  width: '100%'
};

const BASE_STYLE_SIZE: Record<ButtonSize, React.CSSProperties> = {
  small: {
    fontSize: "12px",
    padding: "3px 8px",
  },
  normal: {},
  large: {
    padding: "8px 20px",
  },
};

export default function Button({
  type = "button",
  style: customStyle = {
    backgroundColor: "#e6e6e6",
    borderColor: "#adadad",
  },
  styleHover: customStyleHover = {
    backgroundColor: "#d4d4d4",
    borderColor: "#8c8c8c",
  },
  size = "normal",
  children,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);

  const styleMerged: React.CSSProperties = Object.assign(
    {},
    BASE_STYLE,
    BASE_STYLE_SIZE[size],
    hover ? customStyleHover : customStyle
  );

  return (
    <button
      type={type}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={styleMerged}
      {...rest}
    >
      {children}
    </button>
  );
}
