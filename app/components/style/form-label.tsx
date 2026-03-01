"use client";

import React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const BASE_STYLE: React.CSSProperties = {
  display: "block",
  marginBottom: "5px"
};

export default function FormLabel({ children, style, ...rest }: FormLabelProps) {
  return <label style={{ ...BASE_STYLE, ...style }} {...rest}>{children}</label>;
}
