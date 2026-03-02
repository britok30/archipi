"use client";

import React, { useState, useRef } from "react";
import Panel from "./Panel";
import { FormNumberInput } from "../FormNumberInput";
import { Button } from "@/components/ui/button";
import { Plus, Ruler, Trash } from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { usePlannerStore } from "../../store";

interface GuideListProps {
  entries: [string, unknown][];
  axis: "y" | "x";
  onRemove: (key: string) => void;
  emptyLabel: string;
}

const GuideList: React.FC<GuideListProps> = ({ entries, axis, onRemove, emptyLabel }) => {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[2rem_1fr_2rem] gap-2 px-2 mb-1">
        <span className="text-xs text-muted-foreground">#</span>
        <span className="text-xs text-muted-foreground">Position</span>
        <span />
      </div>
      {entries.map(([key, value], index) => (
        <div
          key={key}
          className="grid grid-cols-[2rem_1fr_2rem] gap-2 items-center px-2 py-2 rounded-md hover:bg-muted/50 transition duration-200 ease-in-out"
        >
          <span className="text-sm text-muted-foreground">{index + 1}</span>
          <span className="text-sm text-foreground font-mono">
            {(value as Record<string, number>)[axis]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-destructive"
            onClick={() => onRemove(key)}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
};

interface AddGuideRowProps {
  onAdd: (value: number) => void;
  min: number;
  max: number;
}

const AddGuideRow: React.FC<AddGuideRowProps> = ({ onAdd, min, max }) => {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);

  const handleAdd = () => {
    const v = valueRef.current;
    if (v >= min && v <= max) {
      onAdd(v);
      setValue(0);
      valueRef.current = 0;
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex items-center gap-2"
      >
        <FormNumberInput
          value={value}
          onChange={(v: number) => {
            setValue(v);
            valueRef.current = v;
          }}
          min={min}
          max={max}
          className="flex-1"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          className="h-9 w-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      <span className="text-[10px] text-muted-foreground mt-1 block">
        {min} – {max}
      </span>
    </div>
  );
};

const PanelGuides: React.FC = () => {
  const scene = usePlannerStore((state) => state.scene);
  const addHorizontalGuide = usePlannerStore((state) => state.addHorizontalGuide);
  const addVerticalGuide = usePlannerStore((state) => state.addVerticalGuide);
  const removeHorizontalGuide = usePlannerStore((state) => state.removeHorizontalGuide);
  const removeVerticalGuide = usePlannerStore((state) => state.removeVerticalGuide);

  const guides = scene.guides || { horizontal: {}, vertical: {} };
  const horizontalEntries = Object.entries(guides.horizontal || {});
  const verticalEntries = Object.entries(guides.vertical || {});

  return (
    <Panel name="Guides" value="guides" icon={<Ruler className="w-3.5 h-3.5" />}>
      <Tabs defaultValue="horizontal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
          <TabsTrigger value="vertical">Vertical</TabsTrigger>
        </TabsList>

        <TabsContent value="horizontal" className="mt-3">
          <GuideList
            entries={horizontalEntries}
            axis="y"
            onRemove={removeHorizontalGuide}
            emptyLabel="No horizontal guides"
          />
          <AddGuideRow onAdd={addHorizontalGuide} min={0} max={scene.width} />
        </TabsContent>

        <TabsContent value="vertical" className="mt-3">
          <GuideList
            entries={verticalEntries}
            axis="x"
            onRemove={removeVerticalGuide}
            emptyLabel="No vertical guides"
          />
          <AddGuideRow onAdd={addVerticalGuide} min={0} max={scene.height} />
        </TabsContent>
      </Tabs>
    </Panel>
  );
};

export default PanelGuides;
