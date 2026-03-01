import React, { CSSProperties, ReactNode } from 'react';

interface IfProps {
  condition: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * @return {null}
 */
export default function If({ condition, style, children }: IfProps): React.ReactElement | null {
  return condition ? (Array.isArray(children) ? <div style={style}>{children}</div> : children as React.ReactElement) : null;
}
