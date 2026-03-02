"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumberInput } from "../FormNumberInput";
import { PropertyLengthMeasure } from "../Properties";
import { Map as ImmutableMap } from "immutable";

interface LineAttributesEditorProps {
  element: ImmutableMap<string, any> | { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: ImmutableMap<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const LineAttributesEditor: React.FC<LineAttributesEditorProps> = ({
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

  const rawVertexOne = attributeFormData.has("vertexOne")
    ? attributeFormData.get("vertexOne")
    : {};

  const rawVertexTwo = attributeFormData.has("vertexTwo")
    ? attributeFormData.get("vertexTwo")
    : {};

  const vertexOne = ImmutableMap.isMap(rawVertexOne) ? rawVertexOne : ImmutableMap(rawVertexOne as any);
  const vertexTwo = ImmutableMap.isMap(rawVertexTwo) ? rawVertexTwo : ImmutableMap(rawVertexTwo as any);

  const lineLength = attributeFormData.has("lineLength")
    ? attributeFormData.get("lineLength")
    : ImmutableMap<string, any>();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="line-name">
          Name
        </Label>
        <Input
          id="line-name"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onUpdate("name", event.target.value)
          }
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
              value={vertexOne.get("x") ?? ""}
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
              value={vertexOne.get("y") ?? ""}
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
              value={vertexTwo.get("x") ?? ""}
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
              value={vertexTwo.get("y") ?? ""}
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
