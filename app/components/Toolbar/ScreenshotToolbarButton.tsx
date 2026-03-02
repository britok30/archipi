"use client";

import React, { useCallback, useState } from "react";
import { usePlannerStore } from "../../store";
import { Camera, Loader2, Check } from "lucide-react";
import ToolbarButton from "./ToolbarButton";
import { MODE_3D_FIRST_PERSON, MODE_3D_VIEW } from "../../store/types";
import { saveSVGtoPngBase64 } from "../../../lib/floorplan-utils/image";
import { downloadDataURI } from "../../../lib/floorplan-utils/browser";

type Status = "idle" | "capturing" | "done";

export default function ScreenshotToolbarButton() {
  const mode = usePlannerStore((state) => state.mode);
  const [status, setStatus] = useState<Status>("idle");

  const is3D = mode === MODE_3D_FIRST_PERSON || mode === MODE_3D_VIEW;

  const capture = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (status === "capturing") return;

      setStatus("capturing");

      try {
        let dataUri: string | null = null;

        if (is3D) {
          const canvas = document.querySelector("canvas");
          if (!canvas) throw new Error("Canvas not found");
          dataUri = canvas.toDataURL("image/png");
        } else {
          // Target the specific drawing SVG, not random page icons
          const svgPaper = document.getElementById("svg-drawing-paper");
          const svg = svgPaper?.closest("svg");
          if (!svg) throw new Error("SVG drawing not found");
          dataUri = await saveSVGtoPngBase64(svg, 2);
        }

        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[T:]/g, "-");
        downloadDataURI(dataUri, `archipi-${timestamp}.png`);

        setStatus("done");
        setTimeout(() => setStatus("idle"), 1500);
      } catch (err) {
        console.error("Screenshot failed:", err);
        setStatus("idle");
      }
    },
    [is3D, status],
  );

  const icon =
    status === "capturing" ? (
      <Loader2 size={20} className="animate-spin" />
    ) : status === "done" ? (
      <Check size={20} />
    ) : (
      <Camera size={20} />
    );

  return (
    <ToolbarButton active={false} tooltip="Screenshot" onClick={capture}>
      {icon}
    </ToolbarButton>
  );
}
