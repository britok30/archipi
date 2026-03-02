"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropertyLengthMeasure from "../Properties/PropertyLengthMeasure";
import { Map as ImmutableMap } from "immutable";

interface HoleAttributesEditorProps {
  element: ImmutableMap<string, any> | { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: ImmutableMap<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const HoleAttributesEditor: React.FC<HoleAttributesEditorProps> = ({
  element,
  onUpdate,
  attributeFormData,
  className = "",
}) => {
  const getElementValue = (key: string) => {
    if (ImmutableMap.isMap(element)) {
      return (element as ImmutableMap<string, any>).get(key);
    }
    return (element as any)[key];
  };

  const name = attributeFormData.has("name")
    ? attributeFormData.get("name")
    : getElementValue("name");
  const offsetA = attributeFormData.has("offsetA")
    ? attributeFormData.get("offsetA")
    : getElementValue("offsetA");
  const offsetB = attributeFormData.has("offsetB")
    ? attributeFormData.get("offsetB")
    : getElementValue("offsetB");

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="hole-name">
          Name
        </Label>
        <Input
          id="hole-name"
          value={name ?? ""}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Enter name"
        />
      </div>

      <PropertyLengthMeasure
        value={offsetA}
        onUpdate={(mapped) => onUpdate("offsetA", mapped)}
        configs={{ label: "Offset 1", min: 0, max: Infinity, precision: 2 }}
      />
      <PropertyLengthMeasure
        value={offsetB}
        onUpdate={(mapped) => onUpdate("offsetB", mapped)}
        configs={{ label: "Offset 2", min: 0, max: Infinity, precision: 2 }}
      />
    </div>
  );
};

export default HoleAttributesEditor;
