"use client";

import React, { useState } from "react";
import Panel from "./Panel";
import {
  Eye,
  EyeOff,
  Trash,
  PlusCircle,
  XCircle,
  CheckCircle,
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

  const [layerAddUIVisible, setLayerAddUIVisible] = useState(false);
  const [editingLayer, setEditingLayer] = useState<EditingLayer | null>(null);

  const layers = scene.layers;
  const selectedLayerId = scene.selectedLayer;
  const layerEntries = Object.entries(layers);

  const handleAddLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!layerAddUIVisible) {
      setEditingLayer({
        name: "",
        opacity: 1,
        altitude: 0,
        order: layerEntries.length,
      });
      setLayerAddUIVisible(true);
    } else {
      setLayerAddUIVisible(false);
    }
  };

  const resetLayerMod = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerAddUIVisible(false);
    setEditingLayer(null);
  };

  const updateLayer = (e: React.MouseEvent, layerData: EditingLayer) => {
    e.stopPropagation();
    const { id: layerId, name, opacity, altitude, order } = layerData;

    if (layerId) {
      setLayerPropertiesAction(layerId, {
        name,
        opacity,
        altitude,
        order,
      });
    } else {
      addLayerAction(name, altitude);
      const newLayerID = usePlannerStore.getState().scene.selectedLayer;
      if (newLayerID) {
        setLayerPropertiesAction(newLayerID, {
          opacity,
          order,
        });
      }
    }

    setLayerAddUIVisible(false);
    setEditingLayer(null);
  };

  const delLayer = (e: React.MouseEvent, layerID: string) => {
    e.stopPropagation();
    removeLayerAction(layerID);
    setLayerAddUIVisible(false);
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
    setLayerAddUIVisible(true);
  };

  const swapVisibility = (e: React.MouseEvent, layer: Layer, layerID: string) => {
    e.stopPropagation();
    setLayerPropertiesAction(layerID, {
      visible: !layer.visible,
    });
  };

  const isCurrentLayer = (layerID: string) => layerID === selectedLayerId;

  if (!VISIBILITY_MODES.includes(mode)) return null;

  const isLastLayer = layerEntries.length === 1;

  return (
    <Panel name="Layers" value="layers" icon={<Layers className="w-3.5 h-3.5" />}>
      <div className="grid grid-cols-4 gap-2 text-foreground mb-3 px-2">
        <div className="text-sm">Altitude</div>
        <div className="text-sm col-span-2">Name</div>
        <div className="text-sm text-right">Actions</div>
      </div>

      {layerEntries.map(([layerID, layer]: [string, Layer]) => (
        <div
          key={layerID}
          className={`grid grid-cols-4 gap-3 text-foreground cursor-pointer hover:bg-muted/50 transition duration-200 ease-in-out py-3 px-3 ${
            isCurrentLayer(layerID) ? "bg-primary/10" : ""
          }`}
          onClick={(e) => selectClick(e, layerID)}
        >
          <div className="text-sm">[ h : {layer.altitude} ]</div>
          <div className="text-sm col-span-2">{layer.name}</div>

          <div className="flex items-center justify-end space-x-2">
            {!isCurrentLayer(layerID) && (
              <Button
                onClick={(e) => swapVisibility(e, layer, layerID)}
                className="p-1"
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4 text-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={(e) => configureClick(e, layer, layerID)}
              className="p-1"
            >
              <PencilIcon size={18} />
            </Button>

            {!isLastLayer && (
              <Button
                variant="ghost"
                onClick={(e) => delLayer(e, layerID)}
                className="p-1"
              >
                <Trash size={18} />
              </Button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-center my-3">
        <Button variant="default" onClick={handleAddLayer}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Layer
        </Button>
      </div>

      {layerAddUIVisible && editingLayer && (
        <div className="p-4 bg-card rounded-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Label className="text-foreground">Name:</Label>
            <Input
              value={editingLayer.name}
              onChange={(e) =>
                setEditingLayer({ ...editingLayer, name: e.target.value })
              }
            />

            <label className="text-foreground">Opacity:</label>
            <Slider
              value={[editingLayer.opacity * 100]}
              onValueChange={(value) =>
                setEditingLayer({ ...editingLayer, opacity: value[0] / 100 })
              }
              min={0}
              max={100}
            />

            <label className="text-foreground">Altitude:</label>
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

            <label className="text-foreground">Order:</label>
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

          <div className="flex justify-end space-x-2">
            <Button variant="destructive" onClick={resetLayerMod}>
              <XCircle className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => updateLayer(e, editingLayer)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
};

export default PanelLayers;
