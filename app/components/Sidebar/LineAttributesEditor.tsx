"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumberInput } from "../FormNumberInput";
import { PropertyLengthMeasure } from "../Properties";

interface LineAttributesEditorProps {
  element: { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: Record<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const LineAttributesEditor: React.FC<LineAttributesEditorProps> = ({
  element,
  onUpdate,
  attributeFormData,
  className = "",
}) => {
  const name = attributeFormData.name ?? element.name ?? "";
  const vertexOne = attributeFormData.vertexOne ?? {};
  const vertexTwo = attributeFormData.vertexTwo ?? {};
  const lineLength = attributeFormData.lineLength;

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
        <Label className="text-xs text-muted-foreground" htmlFor="line-name">
          Name
        </Label>
        <Input
          id="line-name"
          value={nameDraft}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNameDraft(event.target.value)
          }
          onBlur={commitName}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") commitName();
          }}
          placeholder="Enter name"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Vertex 1</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">X</span>
            <FormNumberInput
              id="vertex-one-x"
              value={vertexOne.x ?? ""}
              onChange={(value: number) => onUpdate("vertexOne", { x: value })}
              precision={2}
              min={-Infinity}
              max={Infinity}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">Y</span>
            <FormNumberInput
              id="vertex-one-y"
              value={vertexOne.y ?? ""}
              onChange={(value: number) => onUpdate("vertexOne", { y: value })}
              precision={2}
              min={-Infinity}
              max={Infinity}
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Vertex 2</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">X</span>
            <FormNumberInput
              id="vertex-two-x"
              value={vertexTwo.x ?? ""}
              onChange={(value: number) => onUpdate("vertexTwo", { x: value })}
              precision={2}
              min={-Infinity}
              max={Infinity}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">Y</span>
            <FormNumberInput
              id="vertex-two-y"
              value={vertexTwo.y ?? ""}
              onChange={(value: number) => onUpdate("vertexTwo", { y: value })}
              precision={2}
              min={-Infinity}
              max={Infinity}
            />
          </div>
        </div>
      </div>

      {lineLength && (
        <PropertyLengthMeasure
          value={lineLength}
          onUpdate={(mapped: any) => onUpdate("lineLength", mapped)}
          configs={{
            label: "Length",
            min: 0,
            max: Infinity,
            precision: 2,
          }}
        />
      )}
    </div>
  );
};

export default LineAttributesEditor;
