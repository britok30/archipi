"use client";

import React from "react";
import ItemAttributesEditor from "./ItemsAttributeEditor";
import LineAttributesEditor from "./LineAttributesEditor";
import HoleAttributesEditor from "./HoleAttributesEditor";

interface Element {
  prototype: "items" | "lines" | "holes" | "areas" | string;
  // Add other properties of `element` as needed
}

interface AttributesEditorProps {
  element: Element;
  onUpdate: (data: any, callback?: (arg: any) => void) => void;
  onValid?: (valid: boolean) => void;
  attributeFormData: any;
  state: any;
  [key: string]: any;
}

const AttributesEditor: React.FC<AttributesEditorProps> = ({
  element,
  onUpdate,
  onValid,
  attributeFormData,
  state,
  ...rest
}) => {
  switch (element.prototype) {
    case "items":
      return (
        <ItemAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
          state={state}
          {...rest}
        />
      );
    case "lines":
      return (
        <LineAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
          state={state}
          {...rest}
        />
      );
    case "holes":
      return (
        <HoleAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
          state={state}
          {...rest}
        />
      );
    case "areas":
      return null;
    default:
      return null;
  }
};

export default AttributesEditor;
