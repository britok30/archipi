"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PropertyStringConfig {
  label: string;
  hook?: (
    value: string,
    sourceElement?: any,
    internalState?: any,
    state?: any
  ) => Promise<string>;
}

interface PropertyStringProps {
  value: string;
  onUpdate: (value: string) => void;
  configs: PropertyStringConfig;
  sourceElement?: any;
  internalState?: any;
  state: any;
  className?: string;
}

const PropertyString = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
}: PropertyStringProps) => {
  const handleUpdate = useCallback(
    async (newValue: string) => {
      try {
        if (configs.hook) {
          const processedValue = await configs.hook(
            newValue,
            sourceElement,
            internalState,
            state
          );
          onUpdate(processedValue);
        } else {
          onUpdate(newValue);
        }
      } catch (error) {
        console.error("Error updating property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  return (
    <div className={`space-y-2 ${className} mb-2`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`property-${configs.label}`}
          className="text-sm font-medium capitalize"
        >
          {configs.label}
        </Label>
        <Input
          id={`property-${configs.label}`}
          type="text"
          value={value}
          onChange={(e) => handleUpdate(e.target.value)}
          className="h-9"
        />
      </div>
    </div>
  );
};

export default PropertyString;
