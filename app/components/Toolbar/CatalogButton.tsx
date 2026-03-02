"use client";

import React, { useState } from "react";
import { Book } from "lucide-react";
import { usePlannerStore } from "../../store";
import { MODE_VIEWING_CATALOG } from "../../store/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CatalogList from "../CatalogView/CatalogList";
import ToolbarButton from "./ToolbarButton";

const CatalogButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mode = usePlannerStore((state) => state.mode);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <ToolbarButton
            active={mode === MODE_VIEWING_CATALOG || isOpen}
            tooltip="Catalog"
            onClick={() => setIsOpen(true)}
          >
            <Book size={20} />
          </ToolbarButton>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] h-[80vh] flex flex-col text-foreground">
        <DialogHeader>
          <DialogTitle>Catalog</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          <CatalogList onClose={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogButton;
