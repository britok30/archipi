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

  const handleOpenCatalog = () => {
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          active={mode === MODE_VIEWING_CATALOG}
          tooltip="Open Catalog"
          onClick={handleOpenCatalog}
        >
          <div className="flex items-center space-x-2">
            <Book className="w-6 h-6" />
            <span>Catalog</span>
          </div>
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] h-[80vh] text-black">
        <DialogHeader>
          <DialogTitle>Catalog</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <CatalogList onClose={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogButton;
