"use client";

import React, { useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumberInput } from "../style/export"; // Ensure this component is already converted to TypeScript
import { PropertyLengthMeasure } from "../../catalog/properties/export";
import ReactPlannerContext from "../../context/ReactPlannerContext";
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
  const { translator } = useContext(ReactPlannerContext);

  const getElementValue = (key: string) => {
    if (ImmutableMap.isMap(element)) {
      return (element as ImmutableMap<string, any>).get(key);
    }
    return (element as any)[key];
  };

  // Extracting attribute values with fallback to element's properties
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
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Name Input */}
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="line-name">
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

      {/* Vertex One X */}
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="vertex-one-x">
          X1
        </Label>
        <FormNumberInput
          id="vertex-one-x"
          value={vertexOne.get("x") ?? ""}
          onChange={(value: number) => {
            onUpdate("vertexOne", { x: value });
          }}
          precision={2}
          min={-Infinity}
          max={Infinity}
          placeholder="Enter X1"
        />
      </div>

      {/* Vertex One Y */}
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="vertex-one-y">
          Y1
        </Label>
        <FormNumberInput
          id="vertex-one-y"
          value={vertexOne.get("y") ?? ""}
          onChange={(value: number) => onUpdate("vertexOne", { y: value })}
          precision={2}
          min={-Infinity}
          max={Infinity}
          placeholder="Enter Y1"
        />
      </div>

      {/* Vertex Two X */}
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="vertex-two-x">
          X2
        </Label>
        <FormNumberInput
          id="vertex-two-x"
          value={vertexTwo.get("x") ?? ""}
          onChange={(value: number) => onUpdate("vertexTwo", { x: value })}
          precision={2}
          min={-Infinity}
          max={Infinity}
          placeholder="Enter X2"
        />
      </div>

      {/* Vertex Two Y */}
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="vertex-two-y">
          Y2
        </Label>
        <FormNumberInput
          id="vertex-two-y"
          value={vertexTwo.get("y") ?? ""}
          onChange={(value: number) => onUpdate("vertexTwo", { y: value })}
          precision={2}
          min={-Infinity}
          max={Infinity}
          placeholder="Enter Y2"
        />
      </div>

      {/* Line Length */}
      {lineLength && (
        <PropertyLengthMeasure
          value={lineLength}
          onUpdate={(mapped: any) => onUpdate("lineLength", mapped)}
          configs={{
            label: translator?.t("Length") ?? "Length",
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
