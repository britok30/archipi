"use client";

import React from 'react';
import * as SharedStyle from '../../styles/shared-style';

interface ContentTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const STYLE: React.CSSProperties = {
  color: SharedStyle.PRIMARY_COLOR.alt,
  fontWeight: 300,
};

export default function ContentTitle({ children, style = {}, ...rest }: ContentTitleProps) {
  return <h1 style={{ ...STYLE, ...style }} {...rest}>{children}</h1>;
}
