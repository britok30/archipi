"use client";

import React, { useContext, useCallback, memo } from "react";
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
import { Map as ImmutableMap } from "immutable";

interface Viewer2DProps {
  state: any; // Replace 'any' with the actual type of your app state if available
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

  const { viewer2D, mode, scene } = state;

  const layerID = scene.selectedLayer;

  const mapCursorPosition = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      return { x, y: -y + scene.height };
    },
    [scene.height]
  );

  const onMouseMove = (viewerEvent: any) => {
    // Workaround to allow imageful component to work
    const evt = new Event("mousemove-planner-event") as any;
    evt.viewerEvent = viewerEvent;
    document.dispatchEvent(evt);

    const { x, y } = mapCursorPosition(viewerEvent);

    projectActions.updateMouseCoord({ x, y });

    switch (mode) {
      case constants.MODE_DRAWING_LINE:
        linesActions.updateDrawingLine(x, y, state.snapMask);
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
        linesActions.updateDraggingLine(x, y, state.snapMask);
        break;

      case constants.MODE_DRAGGING_VERTEX:
        verticesActions.updateDraggingVertex(x, y, state.snapMask);
        break;

      case constants.MODE_DRAGGING_ITEM:
        itemsActions.updateDraggingItem(x, y);
        break;

      case constants.MODE_ROTATING_ITEM:
        itemsActions.updateRotatingItem(x, y);
        break;
    }

    viewerEvent.originalEvent.stopPropagation();
  };

  const onMouseDown = (viewerEvent: any) => {
    const event = viewerEvent.originalEvent;

    // Workaround to allow imageful component to work
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
            state.snapMask
          );
          break;

        case "vertices":
          verticesActions.beginDraggingVertex(
            elementData.layer,
            elementData.id,
            x,
            y,
            state.snapMask
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
  };

  const onMouseUp = (viewerEvent: any) => {
    const event = viewerEvent.originalEvent;

    const evt = new Event("mouseup-planner-event") as any;
    evt.viewerEvent = viewerEvent;
    document.dispatchEvent(evt);

    const { x, y } = mapCursorPosition(viewerEvent);

    switch (mode) {
      case constants.MODE_IDLE:
        const elementData = extractElementData(event.target as HTMLElement);

        if (elementData && elementData.selected) return;

        switch (elementData ? elementData.prototype : "none") {
          case "areas":
            areaActions.selectArea(elementData.layer, elementData.id);
            break;

          case "lines":
            linesActions.selectLine(elementData.layer, elementData.id);
            break;

          case "holes":
            holesActions.selectHole(elementData.layer, elementData.id);
            break;

          case "items":
            itemsActions.selectItem(elementData.layer, elementData.id);
            break;

          case "none":
            projectActions.unselectAll();
            break;
        }
        break;

      case constants.MODE_WAITING_DRAWING_LINE:
        linesActions.beginDrawingLine(layerID, x, y, state.snapMask);
        break;

      case constants.MODE_DRAWING_LINE:
        linesActions.endDrawingLine(x, y, state.snapMask);
        linesActions.beginDrawingLine(layerID, x, y, state.snapMask);
        break;

      case constants.MODE_DRAWING_HOLE:
        holesActions.endDrawingHole(layerID, x, y);
        break;

      case constants.MODE_DRAWING_ITEM:
        itemsActions.endDrawingItem(layerID, x, y);
        break;

      case constants.MODE_DRAGGING_LINE:
        linesActions.endDraggingLine(x, y, state.snapMask);
        break;

      case constants.MODE_DRAGGING_VERTEX:
        verticesActions.endDraggingVertex(x, y, state.snapMask);
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
    }

    event.stopPropagation();
  };

  const onChangeValue = (value: Value) => {
    projectActions.updateZoomScale(value.a);
    viewer2DActions.updateCameraView(value);
  };

  const onChangeTool = (tool: Tool) => {
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
  };

  const { e, f, SVGWidth, SVGHeight } = viewer2D.toJS();

  const rulerSize = 15; // px
  const rulerUnitPixelSize = 100;
  const rulerBgColor = "#292929";
  const rulerFnColor = SharedStyle.MATERIAL_COLORS["500"].indigo;
  const rulerMkColor = SharedStyle.MATERIAL_COLORS["500"].indigo;
  const sceneWidth = SVGWidth || scene.width;
  const sceneHeight = SVGHeight || scene.height;
  const sceneZoom = viewer2D.get("zoom") || 1;
  const rulerXElements = Math.ceil(sceneWidth / rulerUnitPixelSize) + 1;
  const rulerYElements = Math.ceil(sceneHeight / rulerUnitPixelSize) + 1;

  return (
    <div
      className="m-0 p-0 grid gap-0 relative"
      style={{
        gridTemplateColumns: `${rulerSize}px ${width - rulerSize}px`,
        gridTemplateRows: `${rulerSize}px ${height - rulerSize}px`,
      }}
    >
      <div
        className="grid-col-1 grid-rows-1"
        style={{ backgroundColor: rulerBgColor }}
      ></div>
      <div
        className="grid-rows-1 grid-cols-2 relative overflow-hidden"
        id="rulerX"
      >
        {sceneWidth ? (
          <RulerX
            unitPixelSize={rulerUnitPixelSize}
            zoom={sceneZoom}
            mouseX={state.mouse.get("x") || 0}
            width={width - rulerSize}
            zeroLeftPosition={e || 0}
            backgroundColor={rulerBgColor}
            fontColor={rulerFnColor}
            markerColor={rulerMkColor}
            positiveUnitsNumber={rulerXElements}
            negativeUnitsNumber={0}
          />
        ) : null}
      </div>
      <div
        className="grid-rows-1 grid-cols-2 relative overflow-hidden"
        id="rulerY"
      >
        {sceneHeight ? (
          <RulerY
            unitPixelSize={rulerUnitPixelSize}
            zoom={sceneZoom}
            mouseY={state.mouse.get("y") || 0}
            height={height - rulerSize}
            zeroTopPosition={sceneHeight * sceneZoom + f || 0}
            backgroundColor={rulerBgColor}
            fontColor={rulerFnColor}
            markerColor={rulerMkColor}
            positiveUnitsNumber={rulerYElements}
            negativeUnitsNumber={0}
          />
        ) : null}
      </div>
      <ReactSVGPanZoom
        style={{ gridColumn: 2, gridRow: 2 }}
        width={width - rulerSize}
        height={height - rulerSize}
        value={viewer2D.isEmpty() ? {} : viewer2D.toJS()}
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
        <svg width={scene.width} height={scene.height}>
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
