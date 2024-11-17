"use client";

import React, { useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumberInput } from "../style/export"; // Ensure this component is already converted to TypeScript
import { PropertyLengthMeasure } from "../../catalog/properties/export";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Map as ImmutableMap } from "immutable";

interface LineAttributesEditorProps {
  /**
   * The current element (line) data as an Immutable Map.
   */
  element: ImmutableMap<string, any>;

  /**
   * Callback function to handle updates to attributes.
   * @param attributeName - The name of the attribute being updated.
   * @param value - The new value for the attribute.
   */
  onUpdate: (attributeName: string, value: any) => void;

  /**
   * The form data for attributes as an Immutable Map.
   */
  attributeFormData: ImmutableMap<string, any>;

  /**
   * The current state of the application.
   */
  state: any; // Replace 'any' with the actual type if available

  /**
   * Additional CSS classes for styling.
   */
  className?: string;

  /**
   * Additional props to pass to child components.
   */
  [key: string]: any;
}

const LineAttributesEditor: React.FC<LineAttributesEditorProps> = ({
  element,
  onUpdate,
  attributeFormData,
  state,
  className = "",
  ...rest
}) => {
  const { translator } = useContext(ReactPlannerContext);

  // Extracting attribute values with fallback to element's properties
  const name = attributeFormData.has("name")
    ? attributeFormData.get("name")
    : element.get("name");

  const vertexOne = attributeFormData.has("vertexOne")
    ? attributeFormData.get("vertexOne")
    : ImmutableMap<string, any>();

  const vertexTwo = attributeFormData.has("vertexTwo")
    ? attributeFormData.get("vertexTwo")
    : ImmutableMap<string, any>();

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
            label: translator.t("Length"),
            min: 0,
            max: Infinity,
            precision: 2,
          }}
          state={state}
        />
      )}
    </div>
  );
};

export default LineAttributesEditor;
