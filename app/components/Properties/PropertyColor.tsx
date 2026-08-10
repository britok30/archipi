"use client";

import { useCallback, useEffect, useState } from "react";
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
  // Keep edits local for live preview; only commit to the store (and undo
  // history) on blur/Enter or when a swatch is picked.
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
        console.error("Error updating color property:", error);
      }
    },
    [configs, onUpdate, sourceElement, internalState, state, value]
  );

  // Don't render in 3D view mode
  if (state?.mode === MODE_3D_VIEW) return null;

  return (
    <div className={`space-y-2 ${className} mb-2`}>
      <div className="grid grid-cols-[6.5rem_1fr] items-center gap-4">
        <Label
          htmlFor={`color-${configs.label}`}
          className="text-xs text-muted-foreground capitalize"
        >
          {configs.label}
        </Label>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-9 shrink-0 p-1"
                aria-label={`Pick color for ${configs.label}`}
              >
                <span
                  className="block h-full w-full rounded-[4px] border border-black/20"
                  style={{ backgroundColor: draft }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="grid gap-3">
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    "#F5F4F0", "#E4E1DA", "#CBCDD2", "#9AA0AB", "#565E6C", "#22262E",
                    "#B4C7E7", "#7FA8F0", "#3B82F6", "#8CC8B5", "#4E9B7F", "#2F6B57",
                    "#E9D8A6", "#D9A45B", "#B5651D", "#D98E8E", "#B33A3A", "#6B4E9B",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-7 w-7 rounded-md border transition-transform hover:scale-110 ${
                        draft.toLowerCase() === color.toLowerCase()
                          ? "border-primary ring-1 ring-primary"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setDraft(color);
                        commit(color);
                      }}
                    >
                      <span className="sr-only">Choose {color}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={/^#([A-Fa-f0-9]{6})$/.test(draft) ? draft : "#888888"}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={(e) => commit(e.target.value)}
                    aria-label="Custom color"
                    className="h-8 w-10 shrink-0 cursor-pointer p-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    Custom color
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Input
            id={`color-${configs.label}`}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(draft);
            }}
            className="h-9 min-w-0 font-mono uppercase"
            placeholder="#000000"
            spellCheck={false}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyColor;
