"use client";

import React, { useState, useEffect, useContext } from "react";
import { Map as ImmutableMap, fromJS, Map, Seq } from "immutable";
import AttributesEditor from "./AttributesEditor";
import { GeometryUtils, MathUtils } from "../../utils/export";
import convert from "convert-units";
import { MdContentCopy, MdContentPaste } from "react-icons/md";
import ReactPlannerContext from "../../context/ReactPlannerContext";

const PRECISION = 2;

const iconHeadStyle: React.CSSProperties = {
  float: "right",
  margin: "-3px 4px 0px 0px",
  padding: 0,
  cursor: "pointer",
  fontSize: "1.4em",
};

interface ElementEditorProps {
  state: any; // Replace 'any' with the actual type of your app state if available
  element: ImmutableMap<string, any>;
  layer: ImmutableMap<string, any>;
}

interface AttributesFormData extends ImmutableMap<string, any> {}
interface PropertiesFormData extends ImmutableMap<string, any> {}

interface Vertex {
  x: number;
  y: number;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  state: appState,
  element,
  layer,
}) => {
  const { projectActions, catalog, translator } =
    useContext(ReactPlannerContext);

  const initAttrData = (
    element: ImmutableMap<string, any>,
    layer: ImmutableMap<string, any>,
    state: any
  ): AttributesFormData | null => {
    element =
      typeof element.get("misc") === "object"
        ? element.set("misc", Map(element.get("misc")))
        : element;

    switch (element.get("prototype")) {
      case "items": {
        return element as AttributesFormData;
      }

      case "lines": {
        const v_a = layer
          .get("vertices")
          .get(element.get("vertices").get(0)) as Vertex;
        const v_b = layer
          .get("vertices")
          .get(element.get("vertices").get(1)) as Vertex;
        const distance = GeometryUtils.pointsDistance(
          v_a.x,
          v_a.y,
          v_b.x,
          v_b.y
        );

        const _unit = element.get("misc").get("_unitLength") || catalog.unit;
        const _length = convert(distance).from(catalog.unit).to(_unit);

        return Map({
          vertexOne: v_a,
          vertexTwo: v_b,
          lineLength: Map({ length: distance, _length, _unit }),
        }) as AttributesFormData;
      }

      case "holes": {
        const line = layer.get("lines").get(element.get("line"));
        const { x: x0, y: y0 } = layer
          .get("vertices")
          .get(line.get("vertices").get(0)) as Vertex;
        const { x: x1, y: y1 } = layer
          .get("vertices")
          .get(line.get("vertices").get(1)) as Vertex;

        const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
        const width = element.get("properties").get("width").get("length");
        const offset = element.get("offset");

        const startAt = lineLength * offset - width / 2;
        const _unitA = element.get("misc").get("_unitA") || catalog.unit;
        const _lengthA = convert(startAt).from(catalog.unit).to(_unitA);

        const endAt = lineLength - lineLength * offset - width / 2;
        const _unitB = element.get("misc").get("_unitB") || catalog.unit;
        const _lengthB = convert(endAt).from(catalog.unit).to(_unitB);

        return Map({
          offset: offset,
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
        }) as AttributesFormData;
      }

      case "areas": {
        return Map({}) as AttributesFormData;
      }

      default:
        return null;
    }
  };

  const initPropData = (
    element: ImmutableMap<string, any>,
    layer: ImmutableMap<string, any>,
    state: any
  ): PropertiesFormData => {
    const catalogElement = catalog.getElement(element.get("type"));
    const mapped = {};

    for (const name in catalogElement.properties) {
      mapped[name] = Map({
        currentValue: element.get("properties").has(name)
          ? element.get("properties").get(name)
          : fromJS(catalogElement.properties[name].defaultValue),
        configs: catalogElement.properties[name],
      });
    }

    return Map(mapped) as PropertiesFormData;
  };

  const [attributesFormData, setAttributesFormData] =
    useState<AttributesFormData | null>(initAttrData(element, layer, appState));
  const [propertiesFormData, setPropertiesFormData] =
    useState<PropertiesFormData>(initPropData(element, layer, appState));

  useEffect(() => {
    setAttributesFormData(initAttrData(element, layer, appState));
    setPropertiesFormData(initPropData(element, layer, appState));
  }, [element, layer, appState]);

  const updateAttribute = (attributeName: string, value: any) => {
    let _attributesFormData = attributesFormData;

    switch (element.get("prototype")) {
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
              attr.set(attributeName, attr.get(attributeName).merge(value));
              const newDistance = GeometryUtils.verticesDistance(
                attr.get("vertexOne"),
                attr.get("vertexTwo")
              );
              attr.mergeIn(
                ["lineLength"],
                attr.get("lineLength").merge({
                  length: newDistance,
                  _length: convert(newDistance)
                    .from(catalog.unit)
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
          case "offsetA": {
            const line = layer.get("lines").get(element.get("line"));
            const orderedVertices = GeometryUtils.orderVertices([
              layer.get("vertices").get(line.get("vertices").get(0)),
              layer.get("vertices").get(line.get("vertices").get(1)),
            ]);
            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices;
            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength = element
              .get("properties")
              .get("width")
              .get("length");
            const halfWidthLength = widthLength / 2;

            let lengthValue = value.get("length");
            lengthValue = Math.max(lengthValue, 0);
            lengthValue = Math.min(lengthValue, lineLength - widthLength);

            const xp = (lengthValue + halfWidthLength) * Math.cos(alpha) + x0;
            const yp = (lengthValue + halfWidthLength) * Math.sin(alpha) + y0;

            const offset = GeometryUtils.pointPositionOnLineSegment(
              x0,
              y0,
              x1,
              y1,
              xp,
              yp
            );

            const endAt = MathUtils.toFixedFloat(
              lineLength - lineLength * offset - halfWidthLength,
              PRECISION
            );
            const offsetUnit = _attributesFormData?.getIn(["offsetB", "_unit"]);
            const offsetB = Map({
              length: endAt,
              _length: convert(endAt).from(catalog.unit).to(offsetUnit),
              _unit: offsetUnit,
            });

            _attributesFormData = _attributesFormData
              ?.set("offsetB", offsetB)
              .set("offset", offset);

            const offsetAttribute = Map({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue).from(catalog.unit).to(value.get("_unit")),
                PRECISION
              ),
            });

            _attributesFormData = _attributesFormData?.set(
              attributeName,
              offsetAttribute
            );
            break;
          }

          case "offsetB": {
            const line = layer.get("lines").get(element.get("line"));
            const orderedVertices = GeometryUtils.orderVertices([
              layer.get("vertices").get(line.get("vertices").get(0)),
              layer.get("vertices").get(line.get("vertices").get(1)),
            ]);
            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices;
            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength = element
              .get("properties")
              .get("width")
              .get("length");
            const halfWidthLength = widthLength / 2;

            let lengthValue = value.get("length");
            lengthValue = Math.max(lengthValue, 0);
            lengthValue = Math.min(lengthValue, lineLength - widthLength);

            const xp = x1 - (lengthValue + halfWidthLength) * Math.cos(alpha);
            const yp = y1 - (lengthValue + halfWidthLength) * Math.sin(alpha);

            const offset = GeometryUtils.pointPositionOnLineSegment(
              x0,
              y0,
              x1,
              y1,
              xp,
              yp
            );

            const startAt = MathUtils.toFixedFloat(
              lineLength * offset - halfWidthLength,
              PRECISION
            );
            const offsetUnit = _attributesFormData?.getIn(["offsetA", "_unit"]);
            const offsetA = Map({
              length: startAt,
              _length: convert(startAt).from(catalog.unit).to(offsetUnit),
              _unit: offsetUnit,
            });

            _attributesFormData = _attributesFormData
              ?.set("offsetA", offsetA)
              .set("offset", offset);

            const offsetAttribute = Map({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue).from(catalog.unit).to(value.get("_unit")),
                PRECISION
              ),
            });

            _attributesFormData = _attributesFormData?.set(
              attributeName,
              offsetAttribute
            );
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

      default:
        break;
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
    propertiesFormData,
    attributesFormData,
  }: {
    propertiesFormData?: PropertiesFormData;
    attributesFormData?: AttributesFormData | null;
  }) => {
    if (propertiesFormData) {
      const properties = propertiesFormData.map((data) =>
        data.get("currentValue")
      );
      projectActions.setProperties(properties);
    }

    if (attributesFormData) {
      switch (element.get("prototype")) {
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

  const copyProperties = (properties: any) => {
    projectActions.copyProperties(properties);
  };

  const pasteProperties = () => {
    projectActions.pasteProperties();
  };

  return (
    <div>
      <AttributesEditor
        //@ts-ignore
        element={element}
        onUpdate={updateAttribute}
        attributeFormData={attributesFormData}
        state={appState}
      />

      <div className="relative my-1 mx-2 border border-white rounded-md">
        <div className="flex items-center justify-end space-x-3 py-2">
          <div
            title={translator.t("Copy")}
            style={iconHeadStyle}
            onClick={() => copyProperties(element.get("properties"))}
          >
            <MdContentCopy />
          </div>
          {appState.get("clipboardProperties") &&
          appState.get("clipboardProperties").size ? (
            <div
              title={translator.t("Paste")}
              style={iconHeadStyle}
              onClick={pasteProperties}
            >
              <MdContentPaste />
            </div>
          ) : null}
        </div>
      </div>

      {propertiesFormData
        .entrySeq()
        .map(([propertyName, data]) => {
          const currentValue = data.currentValue;
          const configs = data.configs;
          const Editor = catalog.getPropertyType(configs.type).Editor;

          return (
            <Editor
              key={propertyName}
              propertyName={propertyName}
              value={currentValue}
              configs={configs}
              onUpdate={(value: any) => updateProperty(propertyName, value)}
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

export default ElementEditor;
