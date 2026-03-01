"use client";

import React from 'react';
import Button, { ButtonProps } from './button';

const STYLE: React.CSSProperties = {
  borderColor: "hsl(217 91% 50%)",
  backgroundColor: "hsl(217 91% 60%)",
  color: "hsl(0 0% 100%)",
};

const STYLE_HOVER: React.CSSProperties = {
  borderColor: "hsl(217 91% 40%)",
  backgroundColor: "hsl(217 91% 50%)",
  color: "hsl(0 0% 100%)",
};

export default function FormSubmitButton({ children, ...rest }: ButtonProps) {
  return (
    <Button type="submit" style={STYLE} styleHover={STYLE_HOVER} {...rest}>
      {children}
    </Button>
  );
}
