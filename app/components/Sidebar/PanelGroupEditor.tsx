"use client";

import React, { useContext } from "react";
import Panel from "./Panel";
import { FormNumberInput, FormTextInput } from "../style/export";
import { FaUnlink } from "react-icons/fa";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { usePlannerStore } from "../../store";
import type { Layer } from "../../store/types";

type ElementCollection = 'lines' | 'holes' | 'items' | 'areas';

const getLayerElement = (
  layers: Record<string, Layer>,
  layerID: string,
  elementPrototype: string,
  elementID: string
): { name?: string } | undefined => {
  const layer = layers[layerID];
  if (!layer) return undefined;
  const collection = layer[elementPrototype as ElementCollection];
  if (!collection) return undefined;
  return collection[elementID];
};

const tableStyle: React.CSSProperties = { width: "100%" };
const firstTdStyle: React.CSSProperties = { width: "6em" };
const inputStyle: React.CSSProperties = { textAlign: "left" };
const tablegroupStyle: React.CSSProperties = {
  width: "100%",
  cursor: "pointer",
  maxHeight: "20em",
  marginLeft: "1px",
  marginTop: "1em",
};
const iconColStyle: React.CSSProperties = { width: "2em" };
const styleEditButton: React.CSSProperties = {
  marginLeft: "5px",
  border: "0px",
  background: "none",
  color: "#fff",
  fontSize: "14px",
  outline: "0px",
};

interface PanelGroupEditorProps {
  groupID: string | null;
}

const PanelGroupEditor: React.FC<PanelGroupEditorProps> = ({ groupID }) => {
  const { translator } = useContext(ReactPlannerContext);
  const scene = usePlannerStore((state) => state.scene);
  const mode = usePlannerStore((state) => state.mode);
  const setGroupProperties = usePlannerStore((state) => state.setGroupProperties);
  const groupTranslate = usePlannerStore((state) => state.groupTranslate);
  const groupRotate = usePlannerStore((state) => state.groupRotate);
  const removeFromGroup = usePlannerStore((state) => state.removeFromGroup);

  if (!groupID) return null;

  const group = scene.groups?.[groupID];
  if (!group) return null;

  const elements = group.elements || {};

  return (
    <Panel name={translator?.t("Group [{0}]", group.name) ?? `Group [${group.name}]`} opened={true}>
      <div style={{ padding: "5px 15px" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={firstTdStyle}>{translator?.t("Name") ?? "Name"}</td>
              <td>
                <FormTextInput
                  value={group.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGroupProperties(groupID, { name: e.target.value })
                  }
                  style={inputStyle}
                />
              </td>
            </tr>
            <tr>
              <td style={firstTdStyle}>X</td>
              <td>
                <FormNumberInput
                  value={group.x}
                  onChange={(value: number) =>
                    groupTranslate(groupID, value, group.y)
                  }
                  style={inputStyle}
                  precision={2}
                />
              </td>
            </tr>
            <tr>
              <td style={firstTdStyle}>Y</td>
              <td>
                <FormNumberInput
                  value={group.y}
                  onChange={(value: number) =>
                    groupTranslate(groupID, group.x, value)
                  }
                  style={inputStyle}
                  precision={2}
                />
              </td>
            </tr>
            <tr>
              <td style={firstTdStyle}>{translator?.t("Rotation") ?? "Rotation"}</td>
              <td>
                <FormNumberInput
                  value={group.rotation}
                  onChange={(value: number) =>
                    groupRotate(groupID, value)
                  }
                  style={inputStyle}
                  precision={2}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {Object.keys(elements).length > 0 ? (
          <div>
            <p
              style={{
                textAlign: "center",
                borderBottom: "1px solid #222",
                paddingBottom: "1em",
              }}
            >
              {translator?.t("Group's Elements") ?? "Group's Elements"}
            </p>
            <table style={tablegroupStyle}>
              <thead>
                <tr>
                  <th style={iconColStyle}></th>
                  <th>{translator?.t("Layer") ?? "Layer"}</th>
                  <th>{translator?.t("Prototype") ?? "Prototype"}</th>
                  <th>{translator?.t("Name") ?? "Name"}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(elements).map(([layerID, layerElements]) => {
                  return Object.entries(layerElements || {}).map(
                    ([elementPrototype, elementList]) => {
                      const ids = Array.isArray(elementList)
                        ? elementList
                        : Object.keys(elementList || {});
                      return ids.map((elementID: string) => {
                        const element =
                          getLayerElement(scene.layers, layerID, elementPrototype, elementID);
                        return (
                          <tr key={elementID}>
                            <td
                              style={iconColStyle}
                              title={translator?.t("Un-chain Element from Group") ?? "Un-chain Element from Group"}
                            >
                              <FaUnlink
                                onClick={() =>
                                  removeFromGroup(
                                    groupID,
                                    layerID,
                                    elementPrototype,
                                    elementID
                                  )
                                }
                                style={styleEditButton}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>{layerID}</td>
                            <td
                              style={{
                                textAlign: "center",
                                textTransform: "capitalize",
                              }}
                            >
                              {elementPrototype}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {element?.name || elementID}
                            </td>
                          </tr>
                        );
                      });
                    }
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default PanelGroupEditor;
