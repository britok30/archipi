"use client";

import React from "react";
import ItemAttributesEditor from "./ItemsAttributeEditor";
import LineAttributesEditor from "./LineAttributesEditor";
import HoleAttributesEditor from "./HoleAttributesEditor";

interface AttributesEditorProps {
  element: { prototype: "items" | "lines" | "holes" | "areas" | string; [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  onValid?: (valid: boolean) => void;
  attributeFormData: any;
}

const AttributesEditor: React.FC<AttributesEditorProps> = ({
  element,
  onUpdate,
  onValid,
  attributeFormData,
}) => {
  switch (element.prototype) {
    case "items":
      return (
        <ItemAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
        />
      );
    case "lines":
      return (
        <LineAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
        />
      );
    case "holes":
      return (
        <HoleAttributesEditor
          element={element}
          onUpdate={onUpdate}
          onValid={onValid}
          attributeFormData={attributeFormData}
        />
      );
    case "areas":
      return null;
    default:
      return null;
  }
};

export default AttributesEditor;
