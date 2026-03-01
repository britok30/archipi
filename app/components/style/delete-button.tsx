"use client";

import React from 'react';
import Button, { ButtonProps } from './button';
import * as SharedStyle from '../../styles/shared-style';

const STYLE: React.CSSProperties = {
  borderColor: "#c12e2a",
  backgroundColor: "#c9302c",
  color: SharedStyle.COLORS.white
};

const STYLE_HOVER: React.CSSProperties = {
  backgroundColor: "#972726",
  borderColor: "#c12e2a",
  color: SharedStyle.COLORS.white
};

export default function FormDeleteButton({ children, ...rest }: ButtonProps) {
  return (
    <Button style={STYLE} styleHover={STYLE_HOVER} {...rest}>
      {children}
    </Button>
  );
}
