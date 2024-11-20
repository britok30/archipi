"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Map } from "immutable";

interface PropertyEnumConfig {
  label: string;
  values: Record<string, string>;
  hook?: (
    value: string,
    sourceElement?: any,
    internalState?: any,
    state?: any
  ) => Promise<string>;
}

interface PropertyEnumProps {
  value: string;
  onUpdate: (value: string) => void;
  configs: PropertyEnumConfig;
  sourceElement?: any;
  internalState?: any;
  state: any;
  className?: string;
}

const PropertyEnum = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
}: PropertyEnumProps) => {
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
        console.error("Error updating enum property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  const enumEntries = Map(configs.values).entrySeq().toArray();

  return (
    <div className={`space-y-2 ${className} mb-2`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`enum-${configs.label}`}
          className="text-sm font-medium capitalize"
        >
          {configs.label}
        </Label>

        <Select value={value} onValueChange={handleUpdate}>
          <SelectTrigger id={`enum-${configs.label}`} className="h-9 text-white bg-black">
            <SelectValue placeholder={`Select ${configs.label}`} />
          </SelectTrigger>
          <SelectContent>
            {enumEntries.map(([key, label]) => (
              <SelectItem key={key} value={key} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Enhanced version with default placeholder and disabled state options
const EnhancedPropertyEnum = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
  disabled = false,
  placeholder,
}: PropertyEnumProps & {
  disabled?: boolean;
  placeholder?: string;
}) => {
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
        console.error("Error updating enum property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  const enumEntries = Map(configs.values).entrySeq().toArray();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`enum-${configs.label}`}
          className={`
            text-sm font-medium capitalize
            ${disabled ? "text-muted-foreground" : ""}
          `}
        >
          {configs.label}
        </Label>

        <Select value={value} onValueChange={handleUpdate} disabled={disabled}>
          <SelectTrigger
            id={`enum-${configs.label}`}
            className={`
              h-9
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <SelectValue
              placeholder={placeholder || `Select ${configs.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {enumEntries.map(([key, label]) => (
              <SelectItem key={key} value={key} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { PropertyEnum as default, EnhancedPropertyEnum };
