import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ToolbarButton from "./ToolbarButton";

const TipsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationTips = [
    {
      device: "Mouse",
      actions: [
        "Left Click + Drag: Rotate camera",
        "Right Click + Drag: Pan camera",
        "Scroll: Zoom in/out",
      ],
    },
    {
      device: "Mac",
      actions: [
        "Command + Click: Move in 3D plane",
        "Option + Click: Orbit around object",
        "Command + Scroll: Zoom with finer control",
      ],
    },
    {
      device: "Windows",
      actions: [
        "Ctrl + Click: Move in 3D plane",
        "Alt + Click: Orbit around object",
        "Ctrl + Scroll: Zoom with finer control",
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Navigation Tips"
          active={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <HelpCircle size={20} />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle>3D Navigation Controls</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {navigationTips.map((section, index) => (
            <div
              key={section.device}
              className={index !== 0 ? "pt-4 border-t border-border" : ""}
            >
              <h3 className="font-medium mb-2">{section.device}</h3>
              <ul className="space-y-2">
                {section.actions.map((action, actionIndex) => (
                  <li key={actionIndex} className="text-sm text-muted-foreground">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipsButton;
