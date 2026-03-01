"use client";
import React, { useState, useEffect } from "react";
import { Map, fromJS } from "immutable";
import AttributesEditor from "./AttributesEditor";
import { GeometryUtils, MathUtils } from "../../utils/export";
import convert, { Unit } from "convert-units";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { Clipboard, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Line, Hole, Item, Area, Layer } from "../../store/types";

type SceneElement = Line | Hole | Item | Area;

interface AttributeValue extends Map<string, any> {
  merge: (value: any) => AttributeValue;
}

const PRECISION = 2;

const ElementEditor = ({ element, layer }: { element: SceneElement; layer: Layer }) => {
  const { catalog } = useCatalogContext();
  const clipboardProperties = usePlannerStore((state) => state.clipboardProperties);
  const setProperties = usePlannerStore((state) => state.setProperties);
  const setItemsAttributes = usePlannerStore((state) => state.setItemsAttributes);
  const setLinesAttributes = usePlannerStore((state) => state.setLinesAttributes);
  const setHolesAttributes = usePlannerStore((state) => state.setHolesAttributes);
  const copyProperties = usePlannerStore((state) => state.copyProperties);
  const pasteProperties = usePlannerStore((state) => state.pasteProperties);
  const initAttrData = (element: SceneElement, layer: Layer) => {
    switch (element.prototype) {
      case "items": {
        return Map(element);
      }
      case "lines": {
        let v_a = layer.vertices[element.vertices[0]];
        let v_b = layer.vertices[element.vertices[1]];
        let distance = GeometryUtils.pointsDistance(v_a.x, v_a.y, v_b.x, v_b.y);
        let _unit = (element.misc as Record<string, any>)?._unitLength || catalog?.unit;
        let _length = convert(distance).from(catalog?.unit as Unit).to(_unit as Unit);
        return Map({
          vertexOne: v_a,
          vertexTwo: v_b,
          lineLength: Map({ length: distance, _length, _unit }),
        });
      }
      case "holes": {
        let line = layer.lines[element.line];
        let { x: x0, y: y0 } = layer.vertices[line.vertices[0]];
        let { x: x1, y: y1 } = layer.vertices[line.vertices[1]];
        let lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
        let widthLength = (element.properties as Record<string, any>)?.width?.length || 0;
        let startAt =
          lineLength * element.offset - widthLength / 2;
        let _unitA = (element.misc as Record<string, any>)?._unitA || catalog?.unit;
        let _lengthA = convert(startAt).from(catalog?.unit as Unit).to(_unitA as Unit);
        let endAt =
          lineLength -
          lineLength * element.offset -
          widthLength / 2;
        let _unitB = (element.misc as Record<string, any>)?._unitB || catalog?.unit;
        let _lengthB = convert(endAt).from(catalog?.unit as Unit).to(_unitB as Unit);
        return Map({
          offset: element.offset,
          offsetA: Map({
            length: MathUtils.toFixedFloat(startAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthA, PRECISION),
            _unit: _unitA,
          }),
          offsetB: Map({
            length: MathUtils.toFixedFloat(endAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthB, PRECISION),
            _unit: _unitB,
          }),
        });
      }
      case "areas": {
        return Map({});
      }
      default:
        return null;
    }
  };
  const initPropData = (element: SceneElement) => {
    let catalogElement = catalog?.getElement(element.type);
    let mapped: Record<string, Map<string, any>> = {};
    for (let name in (catalogElement?.properties || {})) {
      mapped[name] = Map({
        currentValue: (name in (element.properties || {}))
          ? fromJS(element.properties[name])
          : fromJS(catalogElement!.properties[name].defaultValue),
        configs: catalogElement!.properties[name],
      });
    }
    return Map(mapped);
  };
  const [attributesFormData, setAttributesFormData] = useState(
    initAttrData(element, layer)
  );
  const [propertiesFormData, setPropertiesFormData] = useState(
    initPropData(element)
  );
  useEffect(() => {
    setAttributesFormData(initAttrData(element, layer));
    setPropertiesFormData(initPropData(element));
  }, [element, layer]);

  const updateAttribute = (attributeName: string, value: Map<string, any>) => {
    let _attributesFormData: any = attributesFormData;

    switch (element.prototype) {
      case "items": {
        _attributesFormData = _attributesFormData?.set(attributeName, value);
        break;
      }

      case "lines": {
        switch (attributeName) {
          case "lineLength": {
            const v_0 = _attributesFormData?.get("vertexOne") as any;
            const v_1 = _attributesFormData?.get("vertexTwo") as any;
            const [v_a, v_b] = GeometryUtils.orderVertices([v_0, v_1]);

            const v_b_new = GeometryUtils.extendLine(
              v_a.x,
              v_a.y,
              v_b.x,
              v_b.y,
              value.get("length"),
              PRECISION
            );

            _attributesFormData = _attributesFormData?.withMutations((attr: any) => {
              attr.set(
                v_0 === v_a ? "vertexTwo" : "vertexOne",
                v_b.merge(v_b_new)
              );
              attr.set("lineLength", value);
            });
            break;
          }

          case "vertexOne":
          case "vertexTwo": {
            _attributesFormData = _attributesFormData?.withMutations((attr: any) => {
              const currentAttr = attr.get(attributeName) as AttributeValue;
              attr.set(attributeName, currentAttr.merge(value));

              const newDistance = GeometryUtils.verticesDistance(
                attr.get("vertexOne") as any,
                attr.get("vertexTwo") as any
              );

              attr.mergeIn(
                ["lineLength"],
                (attr.get("lineLength") as any).merge({
                  length: newDistance,
                  _length: convert(newDistance)
                    .from(catalog?.unit as Unit)
                    .to((attr.get("lineLength") as any).get("_unit") as Unit),
                })
              );
            });
            break;
          }

          default: {
            _attributesFormData = _attributesFormData?.set(
              attributeName,
              value
            );
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
            const widthLength = (element.properties as Record<string, any>)?.width?.length || 0;
            const halfWidthLength = widthLength / 2;
            let lengthValue = value.get("length");

            lengthValue = Math.max(
              0,
              Math.min(lengthValue, lineLength - widthLength)
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
              yp
            );

            const otherOffset = isOffsetA
              ? MathUtils.toFixedFloat(
                  lineLength - lineLength * offset - halfWidthLength,
                  PRECISION
                )
              : MathUtils.toFixedFloat(
                  lineLength * offset - halfWidthLength,
                  PRECISION
                );

            const otherOffsetUnit = _attributesFormData?.getIn([
              isOffsetA ? "offsetB" : "offsetA",
              "_unit",
            ]);

            const otherOffsetMap = Map({
              length: otherOffset,
              _length: convert(otherOffset)
                .from(catalog?.unit as Unit)
                .to(otherOffsetUnit as Unit),
              _unit: otherOffsetUnit,
            });

            const offsetAttribute = Map({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue)
                  .from(catalog?.unit as Unit)
                  .to(value.get("_unit") as Unit),
                PRECISION
              ),
            });

            _attributesFormData = _attributesFormData
              ?.set(isOffsetA ? "offsetB" : "offsetA", otherOffsetMap)
              ?.set("offset", offset)
              ?.set(attributeName, offsetAttribute);
            break;
          }

          default: {
            _attributesFormData = _attributesFormData?.set(
              attributeName,
              value
            );
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
    let _propertiesFormData = propertiesFormData;
    _propertiesFormData = _propertiesFormData.setIn(
      [propertyName, "currentValue"],
      value
    );
    setPropertiesFormData(_propertiesFormData);
    save({ propertiesFormData: _propertiesFormData });
  };
  const save = ({
    propertiesFormData: propsData,
    attributesFormData: attrsData,
  }: {
    propertiesFormData?: Map<string, any> | Map<unknown, unknown>;
    attributesFormData?: Map<string, any> | Map<unknown, unknown>;
  }) => {
    if (propsData) {
      let properties = propsData.map((data: any) => {
        return data.get("currentValue");
      });
      setProperties(properties.toJS());
    }
    if (attrsData) {
      switch (element.prototype) {
        case "items": {
          setItemsAttributes(attrsData.toJS());
          break;
        }
        case "lines": {
          setLinesAttributes(attrsData.toJS());
          break;
        }
        case "holes": {
          setHolesAttributes(attrsData.toJS());
          break;
        }
      }
    }
  };
  const handleCopyProperties = (properties: Record<string, unknown>) => {
    const props = properties as Record<string, unknown> & { toJS?: () => Record<string, unknown> };
    copyProperties(props.toJS ? props.toJS() : properties);
  };
  const handlePasteProperties = () => {
    pasteProperties();
  };
  return (
    <div>
      <AttributesEditor
        element={element}
        onUpdate={updateAttribute}
        attributeFormData={attributesFormData}
      />

      <div className="flex items-center justify-end space-x-3 py-2 mt-3">
        <Button onClick={() => handleCopyProperties(element.properties)}>
          <Copy />
        </Button>

        {clipboardProperties && Object.keys(clipboardProperties).length > 0 ? (
          <Button variant="ghost" onClick={handlePasteProperties}>
            <Clipboard />
          </Button>
        ) : null}
      </div>

      {(propertiesFormData as any)
        ?.entrySeq()
        .map(([propertyName, data]: [any, any]) => {
          let currentValue = data.get("currentValue"),
            configs = data.get("configs");
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
        })
        .toArray()}
    </div>
  );
};

export default ElementEditor;
