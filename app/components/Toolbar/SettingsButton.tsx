import React, { useState } from "react";
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
import ToolbarButton from "./ToolbarButton";

const SettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scene = usePlannerStore((state) => state.scene);
  const setProjectProperties = usePlannerStore((state) => state.setProjectProperties);
  const rollback = usePlannerStore((state) => state.rollback);

  const [dataWidth, setDataWidth] = useState(scene.width.toString());
  const [dataHeight, setDataHeight] = useState(scene.height.toString());

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const width = parseInt(dataWidth);
    const height = parseInt(dataHeight);
    if (width <= 100 || height <= 100) {
      alert("Scene size too small");
    } else {
      setProjectProperties({ width, height });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    rollback();
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
          <Settings className="w-4 h-4" /> Settings
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] text-black">
        <DialogHeader>
          <DialogTitle>Project Config</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                type="number"
                id="width"
                name="width"
                placeholder="width"
                value={dataWidth}
                onChange={(e) => setDataWidth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                type="number"
                id="height"
                name="height"
                placeholder="height"
                value={dataHeight}
                onChange={(e) => setDataHeight(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3 items-center">
            <Button variant="secondary" type="button" onClick={handleCancel}>
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
