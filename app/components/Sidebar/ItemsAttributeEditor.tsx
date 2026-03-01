"use client";

import React, { useContext } from "react";
import { FormNumberInput } from "../style/export";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Map as ImmutableMap } from "immutable";

interface ItemAttributesEditorProps {
  element: ImmutableMap<string, any> | { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: ImmutableMap<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const ItemAttributesEditor: React.FC<ItemAttributesEditorProps> = ({
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

  const name = attributeFormData.has("name")
    ? attributeFormData.get("name")
    : getElementValue("name");
  const renderedX = attributeFormData.has("x")
    ? attributeFormData.get("x")
    : getElementValue("x");
  const renderedY = attributeFormData.has("y")
    ? attributeFormData.get("y")
    : getElementValue("y");
  const renderedR = attributeFormData.has("rotation")
    ? attributeFormData.get("rotation")
    : getElementValue("rotation");

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="item-name">
          {translator?.t("Name") ?? "Name"}
        </Label>
        <Input
          id="item-name"
          value={name ?? ""}
          onChange={(event) => onUpdate("name", event.target.value)}
          placeholder="Enter name"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="item-x">
          X
        </Label>
        <FormNumberInput
          id="item-x"
          value={renderedX ?? 0}
          onChange={(value: number) => onUpdate("x", value)}
          precision={2}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="item-y">
          Y
        </Label>
        <FormNumberInput
          id="item-y"
          value={renderedY ?? 0}
          onChange={(value: number) => onUpdate("y", value)}
          precision={2}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="text-xs" htmlFor="item-rotation">
          {translator?.t("Rotation") ?? "Rotation"}
        </Label>
        <FormNumberInput
          id="item-rotation"
          value={renderedR ?? 0}
          onChange={(value: number) => onUpdate("rotation", value)}
          precision={2}
        />
      </div>
    </div>
  );
};

export default ItemAttributesEditor;
