"use client";

import React, { useState, useContext } from "react";
import { Map } from "immutable";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import {
  Eye,
  EyeOff,
  Trash,
  PlusCircle,
  XCircle,
  CheckCircle,
  PencilIcon,
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
} from "../../utils/constants";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { v4 as uuid } from "uuid";
import { StateType } from "@/app/models/models";

interface PanelLayersProps {
  state: any; // Replace 'any' with your actual state type
}

const VISIBILITY_MODE = {
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
};

const PanelLayers: React.FC<PanelLayersProps> = ({
  state,
}: {
  state: StateType;
}) => {
  const { sceneActions, translator } = useContext(ReactPlannerContext);
  const [layerAddUIVisible, setLayerAddUIVisible] = useState(false);
  const [editingLayer, setEditingLayer] = useState<Map<string, any> | null>(
    null
  );

  const addLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!layerAddUIVisible) {
      const newLayer = Map({
        name: "",
        opacity: 1,
        altitude: 0,
        //  @ts-ignore
        order: state.scene.layers.size,
      });
      setEditingLayer(newLayer);
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

  const updateLayer = (e: React.MouseEvent, layerData: Map<string, any>) => {
    e.stopPropagation();
    const layerId = layerData.get("id");
    const { name, opacity, altitude, order } = layerData.toJS();

    if (layerId) {
      // Update existing layer
      sceneActions.setLayerProperties(layerId, {
        name,
        opacity,
        altitude: parseInt(altitude, 10),
        order,
      });
    } else {
      // Create new layer
      // Use sceneActions.addLayer to add a new layer
      sceneActions.addLayer(name, parseInt(altitude, 10));

      // Get the new layer's ID
      //  @ts-ignore
      const newLayerID = state.scene.layers.keySeq().last();

      // Set additional properties for the new layer
      sceneActions.setLayerProperties(newLayerID, {
        opacity,
        order,
      });
    }

    setLayerAddUIVisible(false);
    setEditingLayer(null);
  };

  const delLayer = (e: React.MouseEvent, layerID: string) => {
    e.stopPropagation();
    sceneActions.removeLayer(layerID);
    setLayerAddUIVisible(false);
    setEditingLayer(null);
  };

  if (!VISIBILITY_MODE[state.mode]) return null;

  const scene = state.scene;
  //  @ts-ignore
  const isLastLayer = scene.layers.size === 1;

  const selectClick = (e: React.MouseEvent, layerID: string) => {
    e.stopPropagation();
    sceneActions.selectLayer(layerID);
  };

  const configureClick = (e: React.MouseEvent, layer: any, layerID: string) => {
    e.stopPropagation();
    setEditingLayer(layer.set("id", layerID));
    setLayerAddUIVisible(true);
  };

  const swapVisibility = (e: React.MouseEvent, layer: any, layerID: string) => {
    e.stopPropagation();
    sceneActions.setLayerProperties(layerID, {
      visible: !layer.get("visible"),
    });
  };

  //  @ts-ignore
  const isCurrentLayer = (layerID: string) => layerID === scene.selectedLayer;

  return (
    <Panel name="Layers">
      <div className="grid grid-cols-4 gap-2 text-white mb-3 px-2">
        <div className="text-sm">Altitude</div>
        <div className="text-sm col-span-2">Name</div>
        <div className="text-sm text-right">Actions</div>
      </div>

      {/* @ts-ignore */}
      {scene.layers.entrySeq().map(([layerID, layer]: [string, any]) => {
        return (
          <div
            key={layerID}
            className={`grid grid-cols-4 gap-3 text-white cursor-pointer hover:bg-[#292929] transition duration-200 ease-in-out py-3 px-3 ${
              isCurrentLayer(layerID) ? "bg-[#333]" : ""
            }`}
            onClick={(e) => selectClick(e, layerID)}
          >
            <div className="text-sm">[ h : {layer.get("altitude")} ]</div>
            <div className="text-sm col-span-2">{layer.get("name")}</div>

            <div className="flex items-center justify-end space-x-2">
              {!isCurrentLayer && (
                <Button
                  onClick={(e) => swapVisibility(e, layer, layerID)}
                  className="p-1"
                >
                  {layer.get("visible") ? (
                    <Eye className="w-4 h-4 text-white" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
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
        );
      })}
      <div className="flex justify-center my-3">
        <Button variant="default" onClick={addLayer}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Layer
        </Button>
      </div>
      {layerAddUIVisible && editingLayer && (
        <div className="p-4 bg-[#1e1e1e] rounded-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Label className="text-white">Name:</Label>
            <Input
              value={editingLayer.get("name")}
              onChange={(e) =>
                setEditingLayer(editingLayer.set("name", e.target.value))
              }
            />

            <label className="text-white">{translator.t("Opacity")}:</label>
            <Slider
              value={[editingLayer.get("opacity") * 100]}
              onValueChange={(value) =>
                setEditingLayer(editingLayer.set("opacity", value[0] / 100))
              }
              min={0}
              max={100}
            />

            <label className="text-white">{translator.t("Altitude")}:</label>
            <Input
              type="number"
              value={editingLayer.get("altitude") || 0}
              onChange={(e) =>
                setEditingLayer(
                  editingLayer.set("altitude", parseInt(e.target.value, 10))
                )
              }
            />

            <label className="text-white">{translator.t("Order")}:</label>
            <Input
              type="number"
              value={editingLayer.get("order")}
              onChange={(e) =>
                setEditingLayer(
                  editingLayer.set("order", parseInt(e.target.value, 10))
                )
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
