"use client";

import React from "react";

interface PropertyHiddenProps {
  value: any;
  onUpdate: (val: any) => void;
  configs: Record<string, any>;
  sourceElement?: any;
  internalState?: any;
  state: any;
}

export default function PropertyHidden({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
}: PropertyHiddenProps): null {
  return null;
}
