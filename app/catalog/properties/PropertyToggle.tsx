"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface PropertyToggleConfig {
  label: string;
  actionName?: string;
  description?: string;
  hook?: (
    value: boolean,
    sourceElement?: any,
    internalState?: any,
    state?: any
  ) => Promise<boolean>;
}

interface PropertyToggleProps {
  value: boolean;
  onUpdate: (value: boolean) => void;
  configs: PropertyToggleConfig;
  sourceElement?: any;
  internalState?: any;
  state: any;
  className?: string;
  disabled?: boolean;
}

const PropertyToggle = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
  disabled = false,
}: PropertyToggleProps) => {
  const handleUpdate = useCallback(
    async (newValue: boolean) => {
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
        console.error("Error updating toggle property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  // If actionName is provided, render as a button
  if (configs.actionName) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
          <Label
            htmlFor={`toggle-${configs.label}`}
            className={`
              text-sm font-medium capitalize
              ${disabled ? "text-muted-foreground" : ""}
            `}
          >
            {configs.label}
          </Label>
          <Button
            id={`toggle-${configs.label}`}
            onClick={() => handleUpdate(!value)}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            {configs.actionName}
          </Button>
        </div>
        {configs.description && (
          <p className="text-sm text-muted-foreground pl-[8rem]">
            {configs.description}
          </p>
        )}
      </div>
    );
  }

  // Default render with Switch
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`toggle-${configs.label}`}
          className={`
            text-sm font-medium capitalize
            ${disabled ? "text-muted-foreground" : ""}
          `}
        >
          {configs.label}
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            id={`toggle-${configs.label}`}
            checked={value}
            onCheckedChange={handleUpdate}
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">
            {value ? "On" : "Off"}
          </span>
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-[8rem]">
          {configs.description}
        </p>
      )}
    </div>
  );
};

// Enhanced version with animation and custom styling
const EnhancedPropertyToggle = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
  disabled = false,
  customLabel,
  size = "default",
}: PropertyToggleProps & {
  customLabel?: {
    on: string,
    off: string,
  },
  size?: "sm" | "default" | "lg",
}) => {
  const handleUpdate = useCallback(
    async (newValue: boolean) => {
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
        console.error("Error updating toggle property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  const sizeClasses = {
    sm: "h-4 w-8",
    default: "h-6 w-11",
    lg: "h-8 w-14",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`toggle-${configs.label}`}
          className={`
            text-sm font-medium capitalize
            ${disabled ? "text-muted-foreground" : ""}
          `}
        >
          {configs.label}
        </Label>
        <div className="flex items-center gap-3">
          <Switch
            id={`toggle-${configs.label}`}
            checked={value}
            onCheckedChange={handleUpdate}
            disabled={disabled}
            className={`
              transition-all duration-200
              ${sizeClasses[size]}
              ${disabled ? "opacity-50" : ""}
            `}
          />
          <span
            className={`
            text-sm
            ${disabled ? "text-muted-foreground" : ""}
            transition-colors duration-200
          `}
          >
            {customLabel
              ? value
                ? customLabel.on
                : customLabel.off
              : value
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-[8rem]">
          {configs.description}
        </p>
      )}
    </div>
  );
};

export { PropertyToggle as default, EnhancedPropertyToggle };
