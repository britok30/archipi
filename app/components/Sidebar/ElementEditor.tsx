"use client";

import React, { useState, useEffect, useContext } from "react";
import { Map as ImmutableMap, fromJS, List as ImmutableList } from "immutable";
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
  state: ImmutableMap<string, any>;
  element: ImmutableMap<string, any>;
  layer: ImmutableMap<string, any>;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  state: appState,
  element,
  layer,
}) => {
  const { projectActions, catalog, translator } =
    useContext(ReactPlannerContext);

  // Initialize attribute form data
  const initAttrData = (
    element: ImmutableMap<string, any>,
    layer: ImmutableMap<string, any>,
    state: ImmutableMap<string, any>
  ): ImmutableMap<string, any> | null => {
    element =
      typeof element.get("misc") === "object"
        ? element.set("misc", ImmutableMap(element.get("misc")))
        : element;

    switch (element.get("prototype")) {
      case "items": {
        return ImmutableMap(element);
      }
      case "lines": {
        const v_a = layer.getIn(["vertices", element.getIn(["vertices", 0])]);
        const v_b = layer.getIn(["vertices", element.getIn(["vertices", 1])]);

        const distance = GeometryUtils.pointsDistance(
          v_a.get("x"),
          v_a.get("y"),
          v_b.get("x"),
          v_b.get("y")
        );
        const _unit = element.getIn(["misc", "_unitLength"]) || catalog?.unit;
        const _length = convert(distance).from(catalog?.unit).to(_unit);

        return ImmutableMap({
          vertexOne: v_a,
          vertexTwo: v_b,
          lineLength: ImmutableMap({ length: distance, _length, _unit }),
        });
      }
      case "holes": {
        const line = layer.getIn(["lines", element.get("line")]);
        const v0 = layer.getIn(["vertices", line.getIn(["vertices", 0])]);
        const v1 = layer.getIn(["vertices", line.getIn(["vertices", 1])]);

        const x0 = v0.get("x");
        const y0 = v0.get("y");
        const x1 = v1.get("x");
        const y1 = v1.get("y");

        const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
        const widthLength =
          element.getIn(["properties", "width", "length"]) || 0;
        const halfWidthLength = widthLength / 2;

        const startAt = lineLength * element.get("offset") - halfWidthLength;

        const _unitA = element.getIn(["misc", "_unitA"]) || catalog?.unit;
        const _lengthA = convert(startAt).from(catalog?.unit).to(_unitA);

        const endAt =
          lineLength - lineLength * element.get("offset") - halfWidthLength;
        const _unitB = element.getIn(["misc", "_unitB"]) || catalog?.unit;
        const _lengthB = convert(endAt).from(catalog?.unit).to(_unitB);

        return ImmutableMap({
          offset: element.get("offset"),
          offsetA: ImmutableMap({
            length: MathUtils.toFixedFloat(startAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthA, PRECISION),
            _unit: _unitA,
          }),
          offsetB: ImmutableMap({
            length: MathUtils.toFixedFloat(endAt, PRECISION),
            _length: MathUtils.toFixedFloat(_lengthB, PRECISION),
            _unit: _unitB,
          }),
        });
      }
      case "areas": {
        return ImmutableMap({});
      }
      default:
        return null;
    }
  };

  // Initialize property form data
  const initPropData = (
    element: ImmutableMap<string, any>,
    layer: ImmutableMap<string, any>,
    state: ImmutableMap<string, any>
  ): ImmutableMap<string, any> => {
    const catalogElement = catalog?.getElement(element.get("type"));

    const mapped: { [key: string]: ImmutableMap<string, any> } = {};
    for (const name in catalogElement.properties) {
      mapped[name] = ImmutableMap({
        currentValue: element.getIn(["properties", name])
          ? element.getIn(["properties", name])
          : fromJS(catalogElement.properties[name].defaultValue),
        configs: catalogElement.properties[name],
      });
    }

    return ImmutableMap(mapped);
  };

  const [attributesFormData, setAttributesFormData] = useState<ImmutableMap<
    string,
    any
  > | null>(initAttrData(element, layer, appState));

  const [propertiesFormData, setPropertiesFormData] = useState<
    ImmutableMap<string, any>
  >(initPropData(element, layer, appState));

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
              v_a.get("x"),
              v_a.get("y"),
              v_b.get("x"),
              v_b.get("y"),
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
                    .from(catalog?.unit)
                    .to(attr.getIn(["lineLength", "_unit"])),
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
            const line = layer.getIn(["lines", element.get("line")]);

            const orderedVertices = GeometryUtils.orderVertices([
              layer.getIn(["vertices", line.getIn(["vertices", 0])]),
              layer.getIn(["vertices", line.getIn(["vertices", 1])]),
            ]);

            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices.map(
              (v) => ({ x: v.get("x"), y: v.get("y") })
            );

            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength =
              element.getIn(["properties", "width", "length"]) || 0;
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

            const offsetB = ImmutableMap({
              length: endAt,
              _length: convert(endAt).from(catalog.unit).to(offsetUnit),
              _unit: offsetUnit,
            });

            _attributesFormData = _attributesFormData
              ?.set("offsetB", offsetB)
              .set("offset", offset);

            const offsetAttribute = ImmutableMap({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue).from(catalog?.unit).to(value.get("_unit")),
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
            const line = layer.getIn(["lines", element.get("line")]);

            const orderedVertices = GeometryUtils.orderVertices([
              layer.getIn(["vertices", line.getIn(["vertices", 0])]),
              layer.getIn(["vertices", line.getIn(["vertices", 1])]),
            ]);

            const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = orderedVertices.map(
              (v) => ({ x: v.get("x"), y: v.get("y") })
            );

            const alpha = GeometryUtils.angleBetweenTwoPoints(x0, y0, x1, y1);
            const lineLength = GeometryUtils.pointsDistance(x0, y0, x1, y1);
            const widthLength =
              element.getIn(["properties", "width", "length"]) || 0;
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

            const offsetA = ImmutableMap({
              length: startAt,
              _length: convert(startAt).from(catalog?.unit).to(offsetUnit),
              _unit: offsetUnit,
            });

            _attributesFormData = _attributesFormData
              ?.set("offsetA", offsetA)
              .set("offset", offset);

            const offsetAttribute = ImmutableMap({
              length: MathUtils.toFixedFloat(lengthValue, PRECISION),
              _unit: value.get("_unit"),
              _length: MathUtils.toFixedFloat(
                convert(lengthValue).from(catalog?.unit).to(value.get("_unit")),
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
    propertiesFormData?: ImmutableMap<string, any>;
    attributesFormData?: ImmutableMap<string, any> | null;
  }) => {
    if (propertiesFormData) {
      const properties = propertiesFormData.map(
        (data: ImmutableMap<string, any>) => data.get("currentValue")
      ) as ImmutableMap<string, any>;

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
        default:
          break;
      }
    }
  };

  const copyProperties = (properties: ImmutableMap<string, any>) => {
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
              onClick={() => pasteProperties()}
            >
              <MdContentPaste />
            </div>
          ) : null}
        </div>
      </div>

      {propertiesFormData
        ?.entrySeq()
        .map(([propertyName, data]: [string, ImmutableMap<string, any>]) => {
          const currentValue = data.get("currentValue");
          const configs = data.get("configs");

          const { Editor } = catalog.getPropertyType(configs.type);

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
        })}
    </div>
  );
};

export default ElementEditor;
