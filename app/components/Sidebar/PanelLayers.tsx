"use client";

import React, { useState } from "react";
import Panel from "./Panel";
import {
  Eye,
  EyeOff,
  Trash,
  Plus,
  X,
  Check,
  PencilIcon,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_FITTING_IMAGE,
  MODE_UPLOADING_IMAGE,
  MODE_ROTATING_ITEM,
} from "../../store/types";
import type { Layer } from "../../store/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { usePlannerStore } from "../../store";

const VISIBILITY_MODES = [
  MODE_IDLE,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_2D_PAN,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_ROTATING_ITEM,
  MODE_UPLOADING_IMAGE,
  MODE_FITTING_IMAGE,
];

interface EditingLayer {
  id?: string;
  name: string;
  opacity: number;
  altitude: number;
  order: number;
}

const PanelLayers: React.FC = () => {
  const mode = usePlannerStore((state) => state.mode);
  const scene = usePlannerStore((state) => state.scene);
  const selectLayerAction = usePlannerStore((state) => state.selectLayer);
  const setLayerPropertiesAction = usePlannerStore((state) => state.setLayerProperties);
  const addLayerAction = usePlannerStore((state) => state.addLayer);
  const removeLayerAction = usePlannerStore((state) => state.removeLayer);

  const [editingLayer, setEditingLayer] = useState<EditingLayer | null>(null);
  const [newLayerName, setNewLayerName] = useState("");

  const layers = scene.layers;
  const selectedLayerId = scene.selectedLayer;
  const layerEntries = Object.entries(layers);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newLayerName.trim();
    if (!name) return;
    addLayerAction(name, 0);
    const newLayerID = usePlannerStore.getState().scene.selectedLayer;
    if (newLayerID) {
      setLayerPropertiesAction(newLayerID, {
        opacity: 1,
        order: layerEntries.length,
      });
    }
    setNewLayerName("");
  };

  const updateLayer = (e: React.MouseEvent, layerData: EditingLayer) => {
    e.stopPropagation();
    const { id: layerId, name, opacity, altitude, order } = layerData;

    if (layerId) {
      setLayerPropertiesAction(layerId, { name, opacity, altitude, order });
    }

    setEditingLayer(null);
  };

  const delLayer = (e: React.MouseEvent, layerID: string) => {
    e.stopPropagation();
    removeLayerAction(layerID);
    setEditingLayer(null);
  };

  const selectClick = (e: React.MouseEvent, layerID: string) => {
    e.stopPropagation();
    selectLayerAction(layerID);
  };

  const configureClick = (e: React.MouseEvent, layer: Layer, layerID: string) => {
    e.stopPropagation();
    setEditingLayer({
      id: layerID,
      name: layer.name,
      opacity: layer.opacity,
      altitude: layer.altitude,
      order: layer.order,
    });
  };

  const swapVisibility = (e: React.MouseEvent, layer: Layer, layerID: string) => {
    e.stopPropagation();
    setLayerPropertiesAction(layerID, { visible: !layer.visible });
  };

  const isCurrentLayer = (layerID: string) => layerID === selectedLayerId;

  if (!VISIBILITY_MODES.includes(mode)) return null;

  const isLastLayer = layerEntries.length === 1;

  return (
    <Panel name="Layers" value="layers" icon={<Layers className="w-3.5 h-3.5" />}>
      <div className="grid grid-cols-[3rem_1fr_auto] px-2 mb-1">
        <span className="text-xs text-muted-foreground">Alt</span>
        <span className="text-xs text-muted-foreground">Name</span>
        <span />
      </div>

      {layerEntries.map(([layerID, layer]: [string, Layer]) => (
        <div
          key={layerID}
          className={`grid grid-cols-[3rem_1fr_auto] items-center cursor-pointer hover:bg-muted/50 transition duration-200 ease-in-out py-2 px-2 rounded-md ${
            isCurrentLayer(layerID) ? "bg-primary/10" : ""
          }`}
          onClick={(e) => selectClick(e, layerID)}
        >
          <span className="text-sm text-muted-foreground font-mono">
            {layer.altitude}
          </span>
          <span className="text-sm text-foreground truncate">{layer.name}</span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => swapVisibility(e, layer, layerID)}
            >
              {layer.visible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => configureClick(e, layer, layerID)}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>

            {!isLastLayer && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-destructive"
                onClick={(e) => delLayer(e, layerID)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {editingLayer && (
        <div className="p-3 bg-muted/30 rounded-md border border-border/40 mt-2">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Name</Label>
              <Input
                value={editingLayer.name}
                onChange={(e) =>
                  setEditingLayer({ ...editingLayer, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1">
                Opacity — {Math.round(editingLayer.opacity * 100)}%
              </Label>
              <Slider
                value={[editingLayer.opacity * 100]}
                onValueChange={(value) =>
                  setEditingLayer({ ...editingLayer, opacity: value[0] / 100 })
                }
                min={0}
                max={100}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1">Altitude</Label>
              <Input
                type="number"
                value={editingLayer.altitude || 0}
                onChange={(e) =>
                  setEditingLayer({
                    ...editingLayer,
                    altitude: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1">Order</Label>
              <Input
                type="number"
                value={editingLayer.order}
                onChange={(e) =>
                  setEditingLayer({
                    ...editingLayer,
                    order: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingLayer(null);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => updateLayer(e, editingLayer)}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/40">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <Input
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            placeholder="Layer name"
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
      </div>
    </Panel>
  );
};

export default PanelLayers;
