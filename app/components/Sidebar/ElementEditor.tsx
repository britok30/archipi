"use client";
import React, { useState, useEffect } from "react";
import AttributesEditor from "./AttributesEditor";
import { GeometryUtils, MathUtils } from "../../../lib/floorplan-utils/export";
import convert, { Unit } from "convert-units";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { Clipboard, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Line, Hole, Item, Area, Layer } from "../../store/types";

type SceneElement = Line | Hole | Item | Area;

type AttributesFormData = Record<string, any> | null;
type PropertiesFormData = Record<
  string,
  { currentValue: any; configs: Record<string, any> }
>;

const PRECISION = 2;

const ElementEditor = ({
  element,
  layer,
}: {
  element: SceneElement;
  layer: Layer;
}) => {
  const { catalog } = useCatalogContext();
  const clipboardProperties = usePlannerStore(
    (state) => state.clipboardProperties,
  );
  const setProperties = usePlannerStore((state) => state.setProperties);
  const setItemsAttributes = usePlannerStore(
    (state) => state.setItemsAttributes,
  );
  const setLinesAttributes = usePlannerStore(
    (state) => state.setLinesAttributes,
  );
  const setHolesAttributes = usePlannerStore(
    (state) => state.setHolesAttributes,
  );
  const copyProperties = usePlannerStore((state) => state.copyProperties);
  const pasteProperties = usePlannerStore((state) => state.pasteProperties);
  const initAttrData = (
    element: SceneElement,
    layer: Layer,
  ): AttributesFormData => {
    switch (element.prototype) {
      case "items": {
        return { ...element };
      }
      case "lines": {
        let v_a = layer.vertices[element.vertices[0]];
        let v_b = layer.vertices[element.vertices[1]];
        if (!v_a || !v_b) return null;
        let distance = GeometryUtils.pointsDistance(v_a.x, v_a.y, v_b.x, v_b.y);
        let _unit =
          (element.misc as Record<string, any>)?._unitLength || catalog?.unit;
        let _length = convert(distance)
          .from(catalog?.unit as Unit)
          .to(_unit as Unit);
        return {
          vertexOne: v_a,
          vertexTwo: v_b,
          lineLength: { length: distance, _length, _unit },
        };
      }
      case "holes": {
        let line = layer.lines[element.line];
        if (!line) return null;
        let v0 = layer.vertices[line.vertices[0]];
        let v1 = layer.vertices[line.vertices[1]];
        if (!v0 || !v1) return null;
        let { x: x0, y: y0 } = v0;
        let { x: x1, y: y1 } = v1;
        let lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
        let widthLength =
          (element.properties as Record<string, any>)?.width?.length || 0;
        let startAt = lineLength * element.offset - widthLength / 2;
        let _unitA =
          (element.misc as Record<string, any>)?._unitA || catalog?.unit;
        let _lengthA = convert(startAt)
          .from(catalog?.unit as Unit)
          .to(_unitA as Unit);
        let endAt = lineLength - lineLength * element.offset - widthLength / 2;
        let _unitB =
          (element.misc as Record<string, any>)?._unitB || catalog?.unit;
        let _lengthB = convert(endAt)
          .from(catalog?.unit as Unit)
          .to(_unitB as Unit);
        return {
          offset: element.offset,
          offsetA: {
            length: MathUtils.toFixedFloat(startAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthA, PRECISION),
            _unit: _unitA,
          },
          offsetB: {
            length: MathUtils.toFixedFloat(endAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthB, PRECISION),
            _unit: _unitB,
          },
        };
      }
      case "areas": {
        return {};
      }
      default:
        return null;
    }
  };
  const initPropData = (element: SceneElement): PropertiesFormData => {
    let catalogElement =
      catalog?.hasElement(element.type) ? catalog.getElement(element.type) : null;
    let mapped: PropertiesFormData = {};
    for (let name in catalogElement?.properties || {}) {
      mapped[name] = {
        currentValue:
          name in (element.properties || {})
            ? element.properties[name]
            : catalogElement!.properties[name].defaultValue,
        configs: catalogElement!.properties[name],
      };
    }
    return mapped;
  };
  const [attributesFormData, setAttributesFormData] = useState(
    initAttrData(element, layer),
  );
  const [propertiesFormData, setPropertiesFormData] = useState(
    initPropData(element),
  );
  useEffect(() => {
    setAttributesFormData(initAttrData(element, layer));
    setPropertiesFormData(initPropData(element));
  }, [element, layer, catalog]);

  const updateAttribute = (attributeName: string, value: any) => {
    if (!attributesFormData) return;
    let _attributesFormData: Record<string, any> = { ...attributesFormData };

    switch (element.prototype) {
      case "items": {
        _attributesFormData[attributeName] = value;
        break;
      }

      case "lines": {
        switch (attributeName) {
          case "lineLength": {
            const v_0 = _attributesFormData.vertexOne;
            const v_1 = _attributesFormData.vertexTwo;
            const [v_a, v_b] = GeometryUtils.orderVertices([v_0, v_1]);

            const v_b_new = GeometryUtils.extendLine(
              v_a.x,
              v_a.y,
              v_b.x,
              v_b.y,
              (value as { length: number }).length,
              PRECISION,
            );

            _attributesFormData[v_0 === v_a ? "vertexTwo" : "vertexOne"] = {
              ...v_b,
              ...v_b_new,
            };
            _attributesFormData.lineLength = value;
            break;
          }

          case "vertexOne":
          case "vertexTwo": {
            const currentAttr = _attributesFormData[attributeName];
            _attributesFormData[attributeName] = { ...currentAttr, ...value };

            const newDistance = GeometryUtils.verticesDistance(
              _attributesFormData.vertexOne,
              _attributesFormData.vertexTwo,
            );

            const lineLength = _attributesFormData.lineLength || {};
            _attributesFormData.lineLength = {
              ...lineLength,
              length: newDistance,
              _length: convert(newDistance)
                .from(catalog?.unit as Unit)
                .to((lineLength._unit || catalog?.unit) as Unit),
            };
            break;
          }

          default: {
            _attributesFormData[attributeName] = value;
            break;
          }
        }
        break;
      }

      case "holes": {
        switch (attributeName) {
          case "offsetA":
          case "offsetB": {
            const line = layer.lines[element.line || ""];
            if (!line) break;

            const orderedVertices = GeometryUtils.orderVertices([
              layer.vertices[line.vertices[0]],
              layer.vertices[line.vertices[1]],
            ]);

            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices;
            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength =
              (element.properties as Record<string, any>)?.width?.length || 0;
            const halfWidthLength = widthLength / 2;
            let lengthValue = (value as { length: number }).length;

            lengthValue = Math.max(
              0,
              Math.min(lengthValue, lineLength - widthLength),
            );

            const isOffsetA = attributeName === "offsetA";
            const [xp, yp] = isOffsetA
              ? [
                  (lengthValue + halfWidthLength) * Math.cos(alpha) + x0,
                  (lengthValue + halfWidthLength) * Math.sin(alpha) + y0,
                ]
              : [
                  x1 - (lengthValue + halfWidthLength) * Math.cos(alpha),
                  y1 - (lengthValue + halfWidthLength) * Math.sin(alpha),
                ];

            const offset = GeometryUtils.pointPositionOnLineSegment(
              x0,
              y0,
              x1,
              y1,
              xp,
              yp,
            );

            const otherOffset = isOffsetA
              ? MathUtils.toFixedFloat(
                  lineLength - lineLength * offset - halfWidthLength,
                  PRECISION,
                )
              : MathUtils.toFixedFloat(
                  lineLength * offset - halfWidthLength,
                  PRECISION,
                );

            const otherOffsetUnit =
              _attributesFormData[isOffsetA ? "offsetB" : "offsetA"]?._unit ||
              catalog?.unit;

            const otherOffsetValue = {
              length: otherOffset,
              _length: convert(otherOffset)
                .from(catalog?.unit as Unit)
                .to(otherOffsetUnit as Unit),
              _unit: otherOffsetUnit,
            };

            const offsetAttribute = {
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value._unit,
              _length: MathUtils.toFixedFloat(
                convert(lengthValue)
                  .from(catalog?.unit as Unit)
                  .to(value._unit as Unit),
                PRECISION,
              ),
            };

            _attributesFormData[isOffsetA ? "offsetB" : "offsetA"] =
              otherOffsetValue;
            _attributesFormData.offset = offset;
            _attributesFormData[attributeName] = offsetAttribute;
            break;
          }

          default: {
            _attributesFormData[attributeName] = value;
            break;
          }
        }
        break;
      }
    }

    setAttributesFormData(_attributesFormData);
    save({ attributesFormData: _attributesFormData });
  };

  const updateProperty = (propertyName: string, value: any) => {
    const _propertiesFormData: PropertiesFormData = {
      ...propertiesFormData,
      [propertyName]: {
        ...propertiesFormData[propertyName],
        currentValue: value,
      },
    };
    setPropertiesFormData(_propertiesFormData);
    save({ propertiesFormData: _propertiesFormData });
  };
  const save = ({
    propertiesFormData: propsData,
    attributesFormData: attrsData,
  }: {
    propertiesFormData?: PropertiesFormData;
    attributesFormData?: Record<string, any>;
  }) => {
    if (propsData) {
      const properties: Record<string, any> = {};
      for (const name in propsData) {
        properties[name] = propsData[name].currentValue;
      }
      setProperties(properties);
    }
    if (attrsData) {
      switch (element.prototype) {
        case "items": {
          setItemsAttributes(attrsData);
          break;
        }
        case "lines": {
          setLinesAttributes(attrsData);
          break;
        }
        case "holes": {
          setHolesAttributes(attrsData);
          break;
        }
      }
    }
  };
  const handleCopyProperties = (properties: Record<string, unknown>) => {
    const props = properties as Record<string, unknown> & {
      toJS?: () => Record<string, unknown>;
    };
    copyProperties(props.toJS ? props.toJS() : properties);
  };
  const handlePasteProperties = () => {
    pasteProperties();
  };
  if (!attributesFormData) return null;
  // Areas have no editable attributes — skip the empty section.
  const hasAttributes = element.prototype !== "areas";

  return (
    <div className="space-y-3">
      {hasAttributes && (
        <section className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Attributes
          </p>
          <AttributesEditor
            element={element}
            onUpdate={updateAttribute}
            attributeFormData={attributesFormData}
          />
        </section>
      )}

      <section className="rounded-lg border border-border/50 bg-muted/20 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Properties
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Copy properties"
              onClick={() => handleCopyProperties(element.properties)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>

            {clipboardProperties && Object.keys(clipboardProperties).length > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Paste properties"
                onClick={handlePasteProperties}
              >
                <Clipboard className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(propertiesFormData).map(([propertyName, data]) => {
            const { currentValue, configs } = data;
            let { Editor } = catalog?.getPropertyType(configs.type) ?? {};
            if (!Editor) return null;
            const EditorComponent = Editor as React.ComponentType<any>;
            return (
              <EditorComponent
                key={propertyName}
                propertyName={propertyName}
                value={currentValue}
                configs={configs}
                onUpdate={(value: any) => updateProperty(propertyName, value)}
                sourceElement={element}
                internalState={{ attributesFormData, propertiesFormData }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ElementEditor;
