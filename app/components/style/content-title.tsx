"use client";

import React from 'react';

interface ContentTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const STYLE: React.CSSProperties = {
  color: "hsl(217 91% 60%)",
  fontWeight: 300,
};

export default function ContentTitle({ children, style = {}, ...rest }: ContentTitleProps) {
  return <h1 style={{ ...STYLE, ...style }} {...rest}>{children}</h1>;
}
