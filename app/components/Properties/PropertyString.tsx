"use client";

import { useCallback, useEffect, useState } from "react";
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
  state?: any;
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
  // Keep keystrokes local; only commit to the store (and undo history)
  // on blur/Enter.
  const [draft, setDraft] = useState<string>(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = useCallback(
    async (newValue: string) => {
      if (newValue === value) return;
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
    [configs, onUpdate, sourceElement, internalState, state, value]
  );

  return (
    <div className={`space-y-2 ${className} mb-2`}>
      <div className="grid grid-cols-[6.5rem_1fr] items-center gap-4">
        <Label
          htmlFor={`property-${configs.label}`}
          className="text-xs text-muted-foreground capitalize"
        >
          {configs.label}
        </Label>
        <Input
          id={`property-${configs.label}`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(draft);
          }}
          className="h-9"
        />
      </div>
    </div>
  );
};

export default PropertyString;
