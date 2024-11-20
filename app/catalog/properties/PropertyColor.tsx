"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Constants
const MODE_3D_VIEW = "3d_view";

interface PropertyColorConfig {
  label: string;
  hook?: (
    value: string,
    sourceElement?: any,
    internalState?: any,
    state?: any
  ) => Promise<string>;
}

interface PropertyColorProps {
  value: string;
  onUpdate: (value: string) => void;
  configs: PropertyColorConfig;
  sourceElement?: any;
  internalState?: any;
  state: any;
  className?: string;
}

const PropertyColor = ({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
  className = "",
}: PropertyColorProps) => {
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
        console.error("Error updating color property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state]
  );

  // Don't render in 3D view mode
  if (state.get("mode") === MODE_3D_VIEW) return null;

  return (
    <div className={`space-y-2 ${className} mb-2`}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label
          htmlFor={`color-${configs.label}`}
          className="text-xs font-medium capitalize"
        >
          {configs.label}
        </Label>

        <div className="flex items-center gap-2">
          <Input
            id={`color-${configs.label}`}
            type="text"
            value={value}
            onChange={(e) => handleUpdate(e.target.value)}
            className="h-9 font-mono"
            placeholder="#000000"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-9 h-9 p-0"
                aria-label={`Pick color for ${configs.label}`}
              >
                <div
                  className="w-full h-full rounded-sm"
                  style={{ backgroundColor: value }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="grid gap-2">
                <div className="grid grid-cols-5 gap-2">
                  {[
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#ff00ff",
                    "#00ffff",
                    "#000000",
                    "#666666",
                    "#cccccc",
                    "#ffffff",
                  ].map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className="w-8 h-8 p-0"
                      onClick={() => handleUpdate(color)}
                    >
                      <div
                        className="w-full h-full rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="sr-only">Choose {color}</span>
                    </Button>
                  ))}
                </div>
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleUpdate(e.target.value)}
                  className="w-full h-8"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default PropertyColor;
