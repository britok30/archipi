"use client";

import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { usePlannerStore } from "../../store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolbarButton from "./ToolbarButton";

const SNAP_LABELS: Record<string, string> = {
  SNAP_POINT: "Point",
  SNAP_LINE: "Line",
  SNAP_SEGMENT: "Segment",
  SNAP_GRID: "Grid",
  SNAP_GUIDE: "Guide",
};

const UNITS = ["cm", "m", "in", "ft"] as const;

const SettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scene = usePlannerStore((state) => state.scene);
  const snapMask = usePlannerStore((state) => state.snapMask);
  const setProjectProperties = usePlannerStore(
    (state) => state.setProjectProperties
  );
  const toggleSnap = usePlannerStore((state) => state.toggleSnap);

  const [dataWidth, setDataWidth] = useState("");
  const [dataHeight, setDataHeight] = useState("");
  const [dataUnit, setDataUnit] = useState(scene.unit);
  const [error, setError] = useState<string | null>(null);

  // Sync form state from scene when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDataWidth(String(scene.width));
      setDataHeight(String(scene.height));
      setDataUnit(scene.unit);
      setError(null);
    }
  }, [isOpen, scene.width, scene.height, scene.unit]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const width = Number(dataWidth);
    const height = Number(dataHeight);

    if (!width || !height || width <= 100 || height <= 100) {
      setError("Width and height must be greater than 100");
      return;
    }

    setProjectProperties({ width, height, unit: dataUnit });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Project Settings"
          active={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <Settings size={20} />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] text-foreground">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          {/* Scene dimensions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scene
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs">
                  Width
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    id="width"
                    min={101}
                    value={dataWidth}
                    onChange={(e) => {
                      setDataWidth(e.target.value);
                      setError(null);
                    }}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {dataUnit}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs">
                  Height
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    id="height"
                    min={101}
                    value={dataHeight}
                    onChange={(e) => {
                      setDataHeight(e.target.value);
                      setError(null);
                    }}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {dataUnit}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit" className="text-xs">
                Unit
              </Label>
              <Select value={dataUnit} onValueChange={setDataUnit}>
                <SelectTrigger id="unit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* Snap settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Snapping
            </h4>
            <div className="space-y-2">
              {Object.entries(SNAP_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-0.5"
                >
                  <Label
                    htmlFor={key}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={snapMask[key as keyof typeof snapMask]}
                    onCheckedChange={() =>
                      toggleSnap(key as keyof typeof snapMask)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsButton;
