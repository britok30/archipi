"use client";

import React, { useContext, useCallback, memo, useMemo } from "react";
import {
  ReactSVGPanZoom,
  TOOL_NONE,
  TOOL_PAN,
  TOOL_ZOOM_IN,
  TOOL_ZOOM_OUT,
  TOOL_AUTO,
  Value,
  Tool,
} from "react-svg-pan-zoom";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import * as constants from "../../utils/constants";
import { State } from "./state";
import * as SharedStyle from "../../styles/shared-style";
import { RulerX } from "./rulerX";
import { RulerY } from "./rulerY";
import { StateType } from "@/app/models/models";

interface Viewer2DProps {
  state: StateType;
  width: number;
  height: number;
}

const mode2Tool = (mode: string): Tool => {
  switch (mode) {
    case constants.MODE_2D_PAN:
      return TOOL_PAN;
    case constants.MODE_2D_ZOOM_IN:
      return TOOL_ZOOM_IN;
    case constants.MODE_2D_ZOOM_OUT:
      return TOOL_ZOOM_OUT;
    case constants.MODE_IDLE:
      return TOOL_AUTO;
    default:
      return TOOL_NONE;
  }
};

const mode2PointerEvents = (mode: string): React.CSSProperties => {
  switch (mode) {
    case constants.MODE_DRAWING_LINE:
    case constants.MODE_DRAWING_HOLE:
    case constants.MODE_DRAWING_ITEM:
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_ITEM:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
      return { pointerEvents: "none" };
    default:
      return {};
  }
};

const mode2Cursor = (mode: string): React.CSSProperties => {
  switch (mode) {
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
    case constants.MODE_DRAGGING_ITEM:
      return { cursor: "move" };
    case constants.MODE_ROTATING_ITEM:
      return { cursor: "ew-resize" };
    case constants.MODE_WAITING_DRAWING_LINE:
    case constants.MODE_DRAWING_LINE:
      return { cursor: "crosshair" };
    default:
      return { cursor: "default" };
  }
};

const mode2DetectAutopan = (mode: string): boolean => {
  switch (mode) {
    case constants.MODE_DRAWING_LINE:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_ITEM:
    case constants.MODE_DRAWING_HOLE:
    case constants.MODE_DRAWING_ITEM:
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

export const Viewer2D: React.FC<Viewer2DProps> = ({ state, width, height }) => {
  const {
    viewer2DActions,
    linesActions,
    holesActions,
    verticesActions,
    itemsActions,
    areaActions,
    projectActions,
    catalog,
  } = useContext(ReactPlannerContext);
  const { viewer2D, mode, scene, zoom, mouse, snapMask } = state;

  const layerID = scene.get("selectedLayer");
  const sceneWidth = scene.get("width");
  const sceneHeight = scene.get("height");

  // Cache the scene height for mapping function
  const mapCursorPosition = useCallback(
    ({ x, y }: { x: number; y: number }) => ({
      x,
      y: -y + sceneHeight,
    }),
    [sceneHeight]
  );

  const onMouseMove = useCallback(
    (viewerEvent: any) => {
      const evt = new Event("mousemove-planner-event") as any;
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);
      projectActions.updateMouseCoord({ x, y });

      switch (mode) {
        case constants.MODE_DRAWING_LINE:
          linesActions.updateDrawingLine(x, y, String(snapMask));
          break;
        case constants.MODE_DRAWING_HOLE:
          holesActions.updateDrawingHole(layerID, x, y);
          break;
        case constants.MODE_DRAWING_ITEM:
          itemsActions.updateDrawingItem(layerID, x, y);
          break;
        case constants.MODE_DRAGGING_HOLE:
          holesActions.updateDraggingHole(x, y);
          break;
        case constants.MODE_DRAGGING_LINE:
          linesActions.updateDraggingLine(x, y, String(snapMask));
          break;
        case constants.MODE_DRAGGING_VERTEX:
          verticesActions.updateDraggingVertex(x, y, String(snapMask));
          break;
        case constants.MODE_DRAGGING_ITEM:
          itemsActions.updateDraggingItem(x, y);
          break;
        case constants.MODE_ROTATING_ITEM:
          itemsActions.updateRotatingItem(x, y);
          break;
        default:
          break;
      }
      viewerEvent.originalEvent.stopPropagation();
    },
    [
      mapCursorPosition,
      mode,
      projectActions,
      linesActions,
      holesActions,
      itemsActions,
      verticesActions,
      snapMask,
      layerID,
    ]
  );

  const onMouseDown = useCallback(
    (viewerEvent: any) => {
      const event = viewerEvent.originalEvent;
      const evt = new Event("mousedown-planner-event") as any;
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);

      if (mode === constants.MODE_IDLE) {
        const elementData = extractElementData(event.target as HTMLElement);
        if (!elementData || !elementData.selected) return;

        switch (elementData.prototype) {
          case "lines":
            linesActions.beginDraggingLine(
              elementData.layer,
              elementData.id,
              x,
              y,
              String(snapMask)
            );
            break;
          case "vertices":
            verticesActions.beginDraggingVertex(
              elementData.layer,
              elementData.id,
              x,
              y,
              String(snapMask)
            );
            break;
          case "items":
            if (elementData.part === "rotation-anchor")
              itemsActions.beginRotatingItem(
                elementData.layer,
                elementData.id,
                x,
                y
              );
            else
              itemsActions.beginDraggingItem(
                elementData.layer,
                elementData.id,
                x,
                y
              );
            break;
          case "holes":
            holesActions.beginDraggingHole(
              elementData.layer,
              elementData.id,
              x,
              y
            );
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
      linesActions,
      verticesActions,
      itemsActions,
      holesActions,
      snapMask,
    ]
  );

  const onMouseUp = useCallback(
    (viewerEvent: any) => {
      const event = viewerEvent.originalEvent;
      const evt = new Event("mouseup-planner-event") as any;
      evt.viewerEvent = viewerEvent;
      document.dispatchEvent(evt);

      const { x, y } = mapCursorPosition(viewerEvent);

      switch (mode) {
        case constants.MODE_IDLE: {
          const elementData = extractElementData(event.target as HTMLElement);
          if (elementData && elementData.selected) return;
          const proto = elementData ? elementData.prototype : "none";
          switch (proto) {
            case "areas":
              areaActions.selectArea(elementData!.layer, elementData!.id);
              break;
            case "lines":
              linesActions.selectLine(elementData!.layer, elementData!.id);
              break;
            case "holes":
              holesActions.selectHole(elementData!.layer, elementData!.id);
              break;
            case "items":
              itemsActions.selectItem(elementData!.layer, elementData!.id);
              break;
            case "none":
              projectActions.unselectAll();
              break;
            default:
              break;
          }
          break;
        }
        case constants.MODE_WAITING_DRAWING_LINE:
          linesActions.beginDrawingLine(layerID, x, y, String(snapMask));
          break;
        case constants.MODE_DRAWING_LINE:
          linesActions.endDrawingLine(x, y, String(snapMask));
          linesActions.beginDrawingLine(layerID, x, y, String(snapMask));
          break;
        case constants.MODE_DRAWING_HOLE:
          holesActions.endDrawingHole(layerID, x, y);
          break;
        case constants.MODE_DRAWING_ITEM:
          itemsActions.endDrawingItem(layerID, x, y);
          break;
        case constants.MODE_DRAGGING_LINE:
          linesActions.endDraggingLine(x, y, String(snapMask));
          break;
        case constants.MODE_DRAGGING_VERTEX:
          verticesActions.endDraggingVertex(x, y, String(snapMask));
          break;
        case constants.MODE_DRAGGING_ITEM:
          itemsActions.endDraggingItem(x, y);
          break;
        case constants.MODE_DRAGGING_HOLE:
          holesActions.endDraggingHole(x, y);
          break;
        case constants.MODE_ROTATING_ITEM:
          itemsActions.endRotatingItem(x, y);
          break;
        default:
          break;
      }
      event.stopPropagation();
    },
    [
      mode,
      mapCursorPosition,
      areaActions,
      linesActions,
      holesActions,
      itemsActions,
      verticesActions,
      projectActions,
      layerID,
      snapMask,
    ]
  );

  const onChangeValue = useCallback(
    (value: Value) => {
      projectActions.updateZoomScale(value.a);
      viewer2DActions.updateCameraView(value);
    },
    [projectActions, viewer2DActions]
  );

  const onChangeTool = useCallback(
    (tool: Tool) => {
      switch (tool) {
        case TOOL_NONE:
          projectActions.selectToolEdit();
          break;
        case TOOL_PAN:
          viewer2DActions.selectToolPan();
          break;
        case TOOL_ZOOM_IN:
          viewer2DActions.selectToolZoomIn();
          break;
        case TOOL_ZOOM_OUT:
          viewer2DActions.selectToolZoomOut();
          break;
      }
    },
    [projectActions, viewer2DActions]
  );

  // Compute viewer2D value once (if not empty)
  const viewer2DValue = useMemo(
    () => (viewer2D.isEmpty() ? {} : viewer2D.toJS()),
    [viewer2D]
  );

  // Ruler properties
  const rulerSize = 15; // px
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
            mouseX={mouse.get("x") || 0}
            width={width - rulerSize}
            zeroLeftPosition={viewer2D.get("e") || 0}
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
            mouseY={mouse.get("y") || 0}
            height={height - rulerSize}
            zeroTopPosition={sceneHeight * sceneZoom + (viewer2D.get("f") || 0)}
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
        value={viewer2DValue}
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
            <State state={state} catalog={catalog} />
          </g>
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
};

export default memo(Viewer2D);
