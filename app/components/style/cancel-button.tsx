"use client";

import React from 'react';
import Button, { ButtonProps } from './button';

const STYLE: React.CSSProperties = {
  borderColor: "hsl(220 13% 22%)",
  backgroundColor: "hsl(220 13% 14%)",
};

const STYLE_HOVER: React.CSSProperties = {
  backgroundColor: "hsl(220 13% 18%)",
  borderColor: "hsl(220 13% 24%)",
};

export default function CancelButton({ children, ...rest }: ButtonProps) {
  return (
    <Button style={STYLE} styleHover={STYLE_HOVER} {...rest}>
      {children}
    </Button>
  );
}
