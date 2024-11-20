import React, { useState, useContext } from "react";
import { Settings } from "lucide-react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
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

const SettingsButton = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { projectActions, translator } = useContext(ReactPlannerContext);
  const scene = state.scene;

  const [dataWidth, setDataWidth] = useState(scene.width);
  const [dataHeight, setDataHeight] = useState(scene.height);

  const onSubmit = (event) => {
    event.preventDefault();

    let width = parseInt(dataWidth);
    let height = parseInt(dataHeight);
    if (width <= 100 || height <= 100) {
      alert("Scene size too small");
    } else {
      projectActions.setProjectProperties({ width, height });
      setIsOpen(false); // Close dialog after successful save
    }
  };

  const handleCancel = () => {
    projectActions.rollback();
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
            <Button variant="destructive" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsButton;
