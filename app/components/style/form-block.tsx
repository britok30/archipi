"use client";

import React from 'react';

interface FormBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const BASE_STYLE: React.CSSProperties = {
  marginBottom: "16px"
};

export default function FormBlock({ children, style, ...rest }: FormBlockProps) {
  return <div style={{ ...BASE_STYLE, ...style }} {...rest}>{children}</div>;
}
