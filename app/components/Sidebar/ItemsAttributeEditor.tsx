"use client";

import React, { useState, useEffect } from "react";
import { FormNumberInput } from "../FormNumberInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ItemAttributesEditorProps {
  element: { [key: string]: any };
  onUpdate: (attributeName: string, value: any) => void;
  attributeFormData: Record<string, any>;
  onValid?: (valid: boolean) => void;
  className?: string;
}

const ItemAttributesEditor: React.FC<ItemAttributesEditorProps> = ({
  element,
  onUpdate,
  attributeFormData,
  className = "",
}) => {
  const name = attributeFormData.name ?? element.name ?? "";
  const renderedX = attributeFormData.x ?? element.x;
  const renderedY = attributeFormData.y ?? element.y;
  const renderedR = attributeFormData.rotation ?? element.rotation;

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
        <Label className="text-xs text-muted-foreground" htmlFor="item-name">
          Name
        </Label>
        <Input
          id="item-name"
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitName();
          }}
          placeholder="Enter name"
        />
      </div>

      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="item-x">
          X
        </Label>
        <FormNumberInput
          id="item-x"
          value={renderedX ?? 0}
          onChange={(value: number) => onUpdate("x", value)}
          precision={2}
        />
      </div>

      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="item-y">
          Y
        </Label>
        <FormNumberInput
          id="item-y"
          value={renderedY ?? 0}
          onChange={(value: number) => onUpdate("y", value)}
          precision={2}
        />
      </div>

      <div className="grid grid-cols-[4rem_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground" htmlFor="item-rotation">
          Rotation
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
