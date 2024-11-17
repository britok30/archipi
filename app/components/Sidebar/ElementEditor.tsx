"use client";
import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { Map, fromJS } from "immutable";
import AttributesEditor from "./AttributesEditor";
import { GeometryUtils, MathUtils } from "../../utils/export";
import convert, { Unit } from "convert-units";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Clipboard, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Catalog } from "@/app/catalog";
interface Vertex {
  x: number;
  y: number;
  merge: (value: Partial<Vertex>) => Vertex;
}

interface Line {
  vertices: Map<number, string>;
}

interface Layer {
  vertices: Map<string, Vertex>;
  lines: Map<string, Line>;
}

interface Element {
  prototype: "items" | "lines" | "holes";
  line?: string;
  properties: Map<string, any>;
}

interface SaveParams {
  attributesFormData: Map<string, any>;
}

interface AttributeValue extends Map<string, any> {
  merge: (value: any) => AttributeValue;
}

const PRECISION = 2;

const ElementEditor = ({ state: appState, element, layer }) => {
  const { projectActions, catalog } = useContext(ReactPlannerContext);
  const initAttrData = (element, layer, state) => {
    element =
      typeof element.misc === "object"
        ? element.set("misc", Map(element.misc))
        : element;
    switch (element.prototype) {
      case "items": {
        return Map(element);
      }
      case "lines": {
        let v_a = layer.vertices.get(element.vertices.get(0));
        let v_b = layer.vertices.get(element.vertices.get(1));
        let distance = GeometryUtils.pointsDistance(v_a.x, v_a.y, v_b.x, v_b.y);
        let _unit = element.misc.get("_unitLength") || catalog?.unit;
        let _length = convert(distance).from(catalog?.unit).to(_unit);
        return Map({
          vertexOne: v_a,
          vertexTwo: v_b,
          lineLength: Map({ length: distance, _length, _unit }),
        });
      }
      case "holes": {
        let line = layer.lines.get(element.line);
        let { x: x0, y: y0 } = layer.vertices.get(line.vertices.get(0));
        let { x: x1, y: y1 } = layer.vertices.get(line.vertices.get(1));
        let lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
        let startAt =
          lineLength * element.offset -
          element.properties.get("width").get("length") / 2;
        let _unitA = element.misc.get("_unitA") || catalog?.unit;
        let _lengthA = convert(startAt).from(catalog?.unit).to(_unitA);
        let endAt =
          lineLength -
          lineLength * element.offset -
          element.properties.get("width").get("length") / 2;
        let _unitB = element.misc.get("_unitB") || catalog?.unit;
        let _lengthB = convert(endAt).from(catalog?.unit).to(_unitB);
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
  const initPropData = (element, layer, state) => {
    let catalogElement = catalog?.getElement(element.type);
    let mapped = {};
    for (let name in catalogElement.properties) {
      mapped[name] = Map({
        currentValue: element.properties.has(name)
          ? element.properties.get(name)
          : fromJS(catalogElement.properties[name].defaultValue),
        configs: catalogElement.properties[name],
      });
    }
    return Map(mapped);
  };
  const [attributesFormData, setAttributesFormData] = useState(
    initAttrData(element, layer, appState)
  );
  const [propertiesFormData, setPropertiesFormData] = useState(
    initPropData(element, layer, appState)
  );
  useEffect(() => {
    setAttributesFormData(initAttrData(element, layer, appState));
    setPropertiesFormData(initPropData(element, layer, appState));
  }, [element, layer, appState]);

  const updateAttribute = (
    attributeName: string,
    value: Map<string, any>,
    {
      element,
      layer,
      catalog,
      attributesFormData,
      setAttributesFormData,
      save,
    }: {
      element: Element;
      layer: Layer;
      catalog: Catalog;
      attributesFormData: Map<string, any>;
      setAttributesFormData: (data: Map<string, any>) => void;
      save: (params: SaveParams) => void;
    }
  ): void => {
    let _attributesFormData = attributesFormData;

    switch (element.prototype) {
      case "items": {
        _attributesFormData = _attributesFormData?.set(attributeName, value);
        break;
      }

      case "lines": {
        switch (attributeName) {
          case "lineLength": {
            const v_0 = _attributesFormData?.get("vertexOne");
            const v_1 = _attributesFormData?.get("vertexTwo");
            const [v_a, v_b] = GeometryUtils.orderVertices([v_0, v_1]);

            const v_b_new = GeometryUtils.extendLine(
              v_a.x,
              v_a.y,
              v_b.x,
              v_b.y,
              value.get("length"),
              PRECISION
            );

            _attributesFormData = _attributesFormData?.withMutations((attr) => {
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
            _attributesFormData = _attributesFormData?.withMutations((attr) => {
              const currentAttr = attr.get(attributeName) as AttributeValue;
              attr.set(attributeName, currentAttr.merge(value));

              const newDistance = GeometryUtils.verticesDistance(
                attr.get("vertexOne"),
                attr.get("vertexTwo")
              );

              attr.mergeIn(
                ["lineLength"],
                attr.get("lineLength").merge({
                  length: newDistance,
                  _length: convert(newDistance)
                    .from(catalog?.unit as Unit)
                    .to(attr.get("lineLength").get("_unit")),
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
            const line = layer.lines.get(element.line || "");
            if (!line) break;

            const orderedVertices = GeometryUtils.orderVertices([
              layer.vertices.get(line.vertices.get(0)),
              layer.vertices.get(line.vertices.get(1)),
            ]);

            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices;
            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength = element.properties.get("width").get("length");
            const halfWidthLength = widthLength / 2;
            let lengthValue = value.get("length");

            // Constrain length value
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
                .from(catalog.unit as Unit)
                .to(otherOffsetUnit),
              _unit: otherOffsetUnit,
            });

            const offsetAttribute = Map({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue)
                  .from(catalog?.unit as Unit)
                  .to(value.get("_unit")),
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

  const updateProperty = (propertyName, value) => {
    let _propertiesFormData = propertiesFormData;
    _propertiesFormData = _propertiesFormData.setIn(
      [propertyName, "currentValue"],
      value
    );
    setPropertiesFormData(_propertiesFormData);
    save({ propertiesFormData: _propertiesFormData });
  };
  // const reset = () => {
  //   setPropertiesFormData(initPropData(element, layer, state));
  // };
  const save = ({
    propertiesFormData,
    attributesFormData,
  }: {
    propertiesFormData?: Map<string, { [key: string]: any }>;
    attributesFormData?: Map<string, { [key: string]: any }>;
  }) => {
    if (propertiesFormData) {
      let properties = propertiesFormData.map((data) => {
        return data.get("currentValue");
      });
      projectActions.setProperties(properties);
    }
    if (attributesFormData) {
      switch (element.prototype) {
        case "items": {
          projectActions.setItemsAttributes(attributesFormData);
          break;
        }
        case "lines": {
          projectActions.setLinesAttributes(attributesFormData);
          break;
        }
        case "holes": {
          projectActions.setHolesAttributes(attributesFormData);
          break;
        }
      }
    }
  };
  const copyProperties = (properties) => {
    projectActions.copyProperties(properties);
  };
  const pasteProperties = () => {
    projectActions.pasteProperties();
  };
  return (
    <div>
      <AttributesEditor
        element={element}
        onUpdate={updateAttribute}
        attributeFormData={attributesFormData}
        state={appState}
      />

      <div className="flex items-center justify-end space-x-3 py-2 mt-3">
        <Button onClick={(e) => copyProperties(element.properties)}>
          <Copy />
        </Button>

        {appState.get("clipboardProperties") &&
        appState.get("clipboardProperties").size ? (
          <Button variant="ghost" onClick={(e) => pasteProperties()}>
            <Clipboard />
          </Button>
        ) : null}
      </div>

      {propertiesFormData
        ?.entrySeq()
        .map(([propertyName, data]) => {
          let currentValue = data.get("currentValue"),
            configs = data.get("configs");
          let { Editor } = catalog.getPropertyType(configs.type);
          return (
            <Editor
              key={propertyName}
              propertyName={propertyName}
              value={currentValue}
              configs={configs}
              onUpdate={(value) => updateProperty(propertyName, value)}
              state={appState}
              sourceElement={element}
              internalState={{ attributesFormData, propertiesFormData }}
            />
          );
        })
        .toArray()}
    </div>
  );
};

ElementEditor.propTypes = {
  state: PropTypes.object.isRequired,
  element: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
};
export default ElementEditor;
