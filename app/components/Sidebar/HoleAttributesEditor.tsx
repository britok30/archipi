"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropertyLengthMeasure from "../Properties/PropertyLengthMeasure";

interface HoleAttributesEditorProps {
  element: { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: Record<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const HoleAttributesEditor: React.FC<HoleAttributesEditorProps> = ({
  element,
  onUpdate,
  attributeFormData,
  className = "",
}) => {
  const name = attributeFormData.name ?? element.name ?? "";
  const offsetA = attributeFormData.offsetA ?? element.offsetA;
  const offsetB = attributeFormData.offsetB ?? element.offsetB;

  const [nameDraft, setNameDraft] = useState<string>(name);
  useEffect(() => {
    setNameDraft(name);
  }, [name]);

  const commitName = () => {
    if (nameDraft !== name) onUpdate("name", nameDraft);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="hole-name">
          Name
        </Label>
        <Input
          id="hole-name"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitName();
          }}
          placeholder="Enter name"
        />
      </div>

      {offsetA && (
        <PropertyLengthMeasure
          value={offsetA}
          onUpdate={(mapped) => onUpdate("offsetA", mapped)}
          configs={{ label: "Offset 1", min: 0, max: Infinity, precision: 2 }}
        />
      )}
      {offsetB && (
        <PropertyLengthMeasure
          value={offsetB}
          onUpdate={(mapped) => onUpdate("offsetB", mapped)}
          configs={{ label: "Offset 2", min: 0, max: Infinity, precision: 2 }}
        />
      )}
    </div>
  );
};

export default HoleAttributesEditor;
