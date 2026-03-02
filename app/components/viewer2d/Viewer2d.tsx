"use client";

import React, { useCallback, memo, useMemo } from "react";
import {
  ReactSVGPanZoom,
  TOOL_NONE,
  TOOL_PAN,
  TOOL_ZOOM_IN,
  TOOL_ZOOM_OUT,
  TOOL_AUTO,
  Value,
  Tool,
  ViewerMouseEvent,
} from "react-svg-pan-zoom";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import {
  MODE_IDLE,
  MODE_2D_PAN,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_DRAWING_LINE,
  MODE_DRAWING_HOLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_HOLE,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_WAITING_DRAWING_LINE,
  MODE_ROTATING_ITEM,
} from "../../store/types";
import type { Mode } from "../../store/types";
import { State } from "./state";
import * as SharedStyle from "../../styles/shared-style";
import { RulerX } from "./rulerX";
import { RulerY } from "./rulerY";

interface Viewer2DProps {
  width: number;
  height: number;
}

const mode2Tool = (mode: Mode): Tool => {
  switch (mode) {
    case MODE_2D_PAN:
      return TOOL_PAN;
    case MODE_2D_ZOOM_IN:
      return TOOL_ZOOM_IN;
    case MODE_2D_ZOOM_OUT:
      return TOOL_ZOOM_OUT;
    case MODE_IDLE:
      return TOOL_AUTO;
    default:
      return TOOL_NONE;
  }
};

const mode2PointerEvents = (mode: Mode): React.CSSProperties => {
  switch (mode) {
    case MODE_DRAWING_LINE:
    case MODE_DRAWING_HOLE:
    case MODE_DRAWING_ITEM:
    case MODE_DRAGGING_HOLE:
    case MODE_DRAGGING_ITEM:
    case MODE_DRAGGING_LINE:
    case MODE_DRAGGING_VERTEX:
      return { pointerEvents: "none" };
    default:
      return {};
  }
};

const mode2Cursor = (mode: Mode): React.CSSProperties => {
  switch (mode) {
    case MODE_DRAGGING_HOLE:
    case MODE_DRAGGING_LINE:
    case MODE_DRAGGING_VERTEX:
    case MODE_DRAGGING_ITEM:
      return { cursor: "move" };
    case MODE_ROTATING_ITEM:
      return { cursor: "ew-resize" };
    case MODE_WAITING_DRAWING_LINE:
    case MODE_DRAWING_LINE:
    case MODE_DRAWING_ITEM:
    case MODE_DRAWING_HOLE:
      return { cursor: "crosshair" };
    default:
      return { cursor: "default" };
  }
};

const mode2DetectAutopan = (mode: Mode): boolean => {
  switch (mode) {
    case MODE_DRAWING_LINE:
    case MODE_DRAGGING_LINE:
    case MODE_DRAGGING_VERTEX:
    case MODE_DRAGGING_HOLE:
    case MODE_DRAGGING_ITEM:
    case MODE_DRAWING_HOLE:
    case MODE_DRAWING_ITEM:
      return true;
    default:
      return false;
  }
};

interface ElementData {
  part?: string;
  layer: string;
  prototype: string;
  selected: boolean;
  id: string;
}

const extractElementData = (node: HTMLElement): ElementData | null => {
  while (!node.getAttribute("data-element-root") && node.tagName !== "svg") {
    if (node.parentNode) {
      node = node.parentNode as HTMLElement;
    } else {
      return null;
    }
  }
  if (node.tagName === "svg") return null;

  return {
    part: node.getAttribute("data-part") || undefined,
    layer: node.getAttribute("data-layer")!,
    prototype: node.getAttribute("data-prototype")!,
    selected: node.getAttribute("data-selected") === "true",
    id: node.getAttribute("data-id")!,
  };
};

export const Viewer2D: React.FC<Viewer2DProps> = ({ width, height }) => {
  const { catalog } = useCatalogContext();

  // Get state from Zustand
  const mode = usePlannerStore((state) => state.mode);
  const scene = usePlannerStore((state) => state.scene);
  const viewer2D = usePlannerStore((state) => state.viewer2D);
  const zoom = usePlannerStore((state) => state.zoom);
  const mouse = usePlannerStore((state) => state.mouse);

  // Get actions from Zustand
  const updateCameraView = usePlannerStore((state) => state.updateCameraView);
  const updateMouseCoords = usePlannerStore((state) => state.updateMouseCoords);
  const updateZoomScale = usePlannerStore((state) => state.updateZoomScale);
  const selectToolEdit = usePlannerStore((state) => state.selectToolEdit);
  const selectToolPan = usePlannerStore((state) => state.selectToolPan);
  const selectToolZoomIn = usePlannerStore((state) => state.selectToolZoomIn);
  const selectToolZoomOut = usePlannerStore((state) => state.selectToolZoomOut);
  const unselectAll = usePlannerStore((state) => state.unselectAll);

  // Line actions
  const selectLine = usePlannerStore((state) => state.selectLine);
  const beginDrawingLine = usePlannerStore((state) => state.beginDrawingLine);
  const updateDrawingLine = usePlannerStore((state) => state.updateDrawingLine);
  const endDrawingLine = usePlannerStore((state) => state.endDrawingLine);
  const beginDraggingLine = usePlannerStore((state) => state.beginDraggingLine);
  const updateDraggingLine = usePlannerStore((state) => state.updateDraggingLine);
  const endDraggingLine = usePlannerStore((state) => state.endDraggingLine);

  // Vertex actions
  const beginDraggingVertex = usePlannerStore((state) => state.beginDraggingVertex);
  const updateDraggingVertex = usePlannerStore((state) => state.updateDraggingVertex);
  const endDraggingVertex = usePlannerStore((state) => state.endDraggingVertex);

  // Hole actions
  const selectHole = usePlannerStore((state) => state.selectHole);
  const updateDrawingHole = usePlannerStore((state) => state.updateDrawingHole);
  const endDrawingHole = usePlannerStore((state) => state.endDrawingHole);
  const beginDraggingHole = usePlannerStore((state) => state.beginDraggingHole);
  const updateDraggingHole = usePlannerStore((state) => state.updateDraggingHole);
  const endDraggingHole = usePlannerStore((state) => state.endDraggingHole);

  // Item actions
  const selectItem = usePlannerStore((state) => state.selectItem);
  const updateDrawingItem = usePlannerStore((state) => state.updateDrawingItem);
  const endDrawingItem = usePlannerStore((state) => state.endDrawingItem);
  const beginDraggingItem = usePlannerStore((state) => state.beginDraggingItem);
  const updateDraggingItem = usePlannerStore((state) => state.updateDraggingItem);
  const endDraggingItem = usePlannerStore((state) => state.endDraggingItem);
  const beginRotatingItem = usePlannerStore((state) => state.beginRotatingItem);
  const updateRotatingItem = usePlannerStore((state) => state.updateRotatingItem);
  const endRotatingItem = usePlannerStore((state) => state.endRotatingItem);

  // Area actions
  const selectArea = usePlannerStore((state) => state.selectArea);

  const layerID = scene.selectedLayer || "";
  const sceneWidth = scene.width;
  const sceneHeight = scene.height;

  // Map cursor position (flip Y axis)
  const mapCursorPosition = useCallback(
    ({ x, y }: { x: number; y: number }) => ({
      x,
      y: -y + sceneHeight,
    }),
    [sceneHeight]
  );

  const onMouseMove = useCallback(
    (viewerEvent: ViewerMouseEvent<any>) => {
      const evt = new Event("mousemove-planner-event") as Event & { viewerEvent: ViewerMouseEvent<any> };
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);
      updateMouseCoords({ x, y });

      switch (mode) {
        case MODE_DRAWING_LINE:
          updateDrawingLine(x, y);
          break;
        case MODE_DRAWING_HOLE:
          updateDrawingHole(layerID, x, y);
          break;
        case MODE_DRAWING_ITEM:
          updateDrawingItem(layerID, x, y);
          break;
        case MODE_DRAGGING_HOLE:
          updateDraggingHole(x, y);
          break;
        case MODE_DRAGGING_LINE:
          updateDraggingLine(x, y);
          break;
        case MODE_DRAGGING_VERTEX:
          updateDraggingVertex(x, y);
          break;
        case MODE_DRAGGING_ITEM:
          updateDraggingItem(x, y);
          break;
        case MODE_ROTATING_ITEM:
          updateRotatingItem(x, y);
          break;
        default:
          break;
      }
      viewerEvent.originalEvent.stopPropagation();
    },
    [
      mapCursorPosition,
      mode,
      layerID,
      updateMouseCoords,
      updateDrawingLine,
      updateDrawingHole,
      updateDrawingItem,
      updateDraggingHole,
      updateDraggingLine,
      updateDraggingVertex,
      updateDraggingItem,
      updateRotatingItem,
    ]
  );

  const onMouseDown = useCallback(
    (viewerEvent: ViewerMouseEvent<any>) => {
      const event = viewerEvent.originalEvent;
      const evt = new Event("mousedown-planner-event") as Event & { viewerEvent: ViewerMouseEvent<any> };
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);

      if (mode === MODE_IDLE) {
        const elementData = extractElementData(event.target as HTMLElement);
        if (!elementData || !elementData.selected) return;

        switch (elementData.prototype) {
          case "lines":
            beginDraggingLine(elementData.layer, elementData.id, x, y);
            break;
          case "vertices":
            beginDraggingVertex(elementData.layer, elementData.id, x, y);
            break;
          case "items":
            if (elementData.part === "rotation-anchor")
              beginRotatingItem(elementData.layer, elementData.id, x, y);
            else
              beginDraggingItem(elementData.layer, elementData.id, x, y);
            break;
          case "holes":
            beginDraggingHole(elementData.layer, elementData.id, x, y);
            break;
          default:
            break;
        }
      }
      event.stopPropagation();
    },
    [
      mode,
      mapCursorPosition,
      beginDraggingLine,
      beginDraggingVertex,
      beginDraggingItem,
      beginRotatingItem,
      beginDraggingHole,
    ]
  );

  const onMouseUp = useCallback(
    (viewerEvent: ViewerMouseEvent<any>) => {
      const event = viewerEvent.originalEvent;
      const evt = new Event("mouseup-planner-event") as Event & { viewerEvent: ViewerMouseEvent<any> };
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);

      switch (mode) {
        case MODE_IDLE: {
          const elementData = extractElementData(event.target as HTMLElement);
          if (elementData && elementData.selected) return;
          const proto = elementData ? elementData.prototype : "none";
          switch (proto) {
            case "areas":
              selectArea(elementData!.layer, elementData!.id);
              break;
            case "lines":
              selectLine(elementData!.layer, elementData!.id);
              break;
            case "holes":
              selectHole(elementData!.layer, elementData!.id);
              break;
            case "items":
              selectItem(elementData!.layer, elementData!.id);
              break;
            case "none":
              unselectAll();
              break;
            default:
              break;
          }
          break;
        }
        case MODE_WAITING_DRAWING_LINE:
          beginDrawingLine(layerID, x, y);
          break;
        case MODE_DRAWING_LINE:
          endDrawingLine(x, y);
          break;
        case MODE_DRAWING_HOLE:
          endDrawingHole(layerID, x, y);
          break;
        case MODE_DRAWING_ITEM:
          endDrawingItem(layerID, x, y);
          break;
        case MODE_DRAGGING_LINE:
          endDraggingLine(x, y);
          break;
        case MODE_DRAGGING_VERTEX:
          endDraggingVertex(x, y);
          break;
        case MODE_DRAGGING_ITEM:
          endDraggingItem(x, y);
          break;
        case MODE_DRAGGING_HOLE:
          endDraggingHole(x, y);
          break;
        case MODE_ROTATING_ITEM:
          endRotatingItem(x, y);
          break;
        default:
          break;
      }
      event.stopPropagation();
    },
    [
      mode,
      mapCursorPosition,
      layerID,
      selectArea,
      selectLine,
      selectHole,
      selectItem,
      unselectAll,
      beginDrawingLine,
      endDrawingLine,
      endDrawingHole,
      endDrawingItem,
      endDraggingLine,
      endDraggingVertex,
      endDraggingItem,
      endDraggingHole,
      endRotatingItem,
    ]
  );

  const onChangeValue = useCallback(
    (value: Value) => {
      updateZoomScale(value.a);
      updateCameraView(value);
    },
    [updateZoomScale, updateCameraView]
  );

  const onChangeTool = useCallback(
    (tool: Tool) => {
      switch (tool) {
        case TOOL_NONE:
          selectToolEdit();
          break;
        case TOOL_PAN:
          selectToolPan();
          break;
        case TOOL_ZOOM_IN:
          selectToolZoomIn();
          break;
        case TOOL_ZOOM_OUT:
          selectToolZoomOut();
          break;
      }
    },
    [selectToolEdit, selectToolPan, selectToolZoomIn, selectToolZoomOut]
  );

  // Viewer2D value (plain object now)
  const viewer2DValue = useMemo(
    () => (Object.keys(viewer2D).length === 0 ? {} : viewer2D),
    [viewer2D]
  );

  // Ruler properties
  const rulerSize = 15;
  const rulerUnitPixelSize = 100;
  const rulerBgColor = "#292929";
  const rulerFnColor = SharedStyle.MATERIAL_COLORS["500"].indigo;
  const rulerMkColor = SharedStyle.MATERIAL_COLORS["500"].indigo;
  const sceneZoom = zoom || 1;
  const rulerXElements = Math.ceil(sceneWidth / rulerUnitPixelSize) + 1;
  const rulerYElements = Math.ceil(sceneHeight / rulerUnitPixelSize) + 1;

  // Container grid style
  const containerStyle = useMemo(
    () => ({
      gridTemplateColumns: `${rulerSize}px ${width - rulerSize}px`,
      gridTemplateRows: `${rulerSize}px ${height - rulerSize}px`,
    }),
    [width, height, rulerSize]
  );

  return (
    <div className="m-0 p-0 grid gap-0 relative" style={containerStyle}>
      <div
        className="grid-col-1 grid-rows-1"
        style={{ backgroundColor: rulerBgColor }}
      />
      <div
        className="grid-rows-1 grid-cols-2 relative overflow-hidden"
        id="rulerX"
      >
        {sceneWidth && (
          <RulerX
            unitPixelSize={rulerUnitPixelSize}
            zoom={sceneZoom}
            mouseX={mouse.x || 0}
            width={width - rulerSize}
            zeroLeftPosition={viewer2D.e || 0}
            backgroundColor={rulerBgColor}
            fontColor={rulerFnColor}
            markerColor={rulerMkColor}
            positiveUnitsNumber={rulerXElements}
            negativeUnitsNumber={0}
          />
        )}
      </div>
      <div
        className="grid-rows-1 grid-cols-2 relative overflow-hidden"
        id="rulerY"
      >
        {sceneHeight && (
          <RulerY
            unitPixelSize={rulerUnitPixelSize}
            zoom={sceneZoom}
            mouseY={mouse.y || 0}
            height={height - rulerSize}
            zeroTopPosition={sceneHeight * sceneZoom + (viewer2D.f || 0)}
            backgroundColor={rulerBgColor}
            fontColor={rulerFnColor}
            markerColor={rulerMkColor}
            positiveUnitsNumber={rulerYElements}
            negativeUnitsNumber={0}
          />
        )}
      </div>
      <ReactSVGPanZoom
        style={{ gridColumn: 2, gridRow: 2 }}
        width={width - rulerSize}
        height={height - rulerSize}
        value={viewer2DValue as any}
        onChangeValue={onChangeValue}
        tool={mode2Tool(mode)}
        onChangeTool={onChangeTool}
        detectAutoPan={mode2DetectAutopan(mode)}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        toolbarProps={{ position: "none" }}
        miniatureProps={{
          position: "none",
          background: "#616264",
          width: 100,
          height: 80,
        }}
      >
        <svg width={sceneWidth} height={sceneHeight}>
          <defs>
            <pattern
              id="diagonalFill"
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
              fill="#FFF"
            >
              <rect x="0" y="0" width="4" height="4" fill="#FFF" />
              <path
                d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                style={{ stroke: "#8E9BA2", strokeWidth: 1 }}
              />
            </pattern>
          </defs>
          <g style={{ ...mode2Cursor(mode), ...mode2PointerEvents(mode) }}>
            <State scene={scene} catalog={catalog} />
          </g>
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
};

export default memo(Viewer2D);
