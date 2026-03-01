"use client";

import React from 'react';
import Button, { ButtonProps } from './button';

const STYLE: React.CSSProperties = {
  borderColor: "hsl(0 84% 40%)",
  backgroundColor: "hsl(0 84% 45%)",
  color: "hsl(0 0% 100%)",
};

const STYLE_HOVER: React.CSSProperties = {
  backgroundColor: "hsl(0 84% 35%)",
  borderColor: "hsl(0 84% 40%)",
  color: "hsl(0 0% 100%)",
};

export default function FormDeleteButton({ children, ...rest }: ButtonProps) {
  return (
    <Button style={STYLE} styleHover={STYLE_HOVER} {...rest}>
      {children}
    </Button>
  );
}
