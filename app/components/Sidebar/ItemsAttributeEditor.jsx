"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import FormNumberInput from "../style/FormNumberInput";
import FormTextInput from "../style/form-text-input";
import ReactPlannerContext from "../../context/ReactPlannerContext";

const tableStyle = { width: "100%" };
const firstTdStyle = { width: "6em" };
const inputStyle = { textAlign: "left" };

const ItemAttributesEditor = ({
  element,
  onUpdate,
  attributeFormData,
  state,
  ...rest
}) => {
  const { translator } = useContext(ReactPlannerContext);

  let name = attributeFormData.has("name")
    ? attributeFormData.get("name")
    : element.name;
  let renderedX = attributeFormData.has("x")
    ? attributeFormData.get("x")
    : element.x;
  let renderedY = attributeFormData.has("y")
    ? attributeFormData.get("y")
    : element.y;
  let renderedR = attributeFormData.has("rotation")
    ? attributeFormData.get("rotation")
    : element.rotation;

  return (
    <table style={tableStyle}>
      <tbody>
        <tr>
          <td style={firstTdStyle}>{translator.t("Name")}</td>
          <td>
            <FormTextInput
              value={name}
              onChange={(event) => onUpdate("name", event.target.value)}
              style={inputStyle}
            />
          </td>
        </tr>
        <tr>
          <td style={firstTdStyle}>X</td>
          <td>
            <FormNumberInput
              value={renderedX}
              onChange={(value) => onUpdate("x", value)}
              style={inputStyle}
              state={state}
              precision={2}
              {...rest}
            />
          </td>
        </tr>
        <tr>
          <td style={firstTdStyle}>Y</td>
          <td>
            <FormNumberInput
              value={renderedY}
              onChange={(value) => onUpdate("y", value)}
              style={inputStyle}
              state={state}
              precision={2}
              {...rest}
            />
          </td>
        </tr>
        <tr>
          <td style={firstTdStyle}>{translator.t("Rotation")}</td>
          <td>
            <FormNumberInput
              value={renderedR}
              onChange={(value) => {
                onUpdate("rotation", value);
              }}
              style={inputStyle}
              state={state}
              precision={2}
              {...rest}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

ItemAttributesEditor.propTypes = {
  element: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  attributeFormData: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

export default ItemAttributesEditor;
