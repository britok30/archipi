"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import { FormNumberInput, FormTextInput } from "../style/export";
import { PropertyLengthMeasure } from "../../catalog/properties/export";
import ReactPlannerContext from "../../context/ReactPlannerContext";

const tableStyle = { width: "100%" };
const firstTdStyle = { width: "6em" };
const inputStyle = { textAlign: "left" };

const LineAttributesEditor = ({
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
  let vertexOne = attributeFormData.has("vertexOne")
    ? attributeFormData.get("vertexOne")
    : null;
  let vertexTwo = attributeFormData.has("vertexTwo")
    ? attributeFormData.get("vertexTwo")
    : null;
  let lineLength = attributeFormData.has("lineLength")
    ? attributeFormData.get("lineLength")
    : null;

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-2">
        <label>Name</label>
        <FormTextInput
          value={name}
          onChange={(event) => onUpdate("name", event.target.value)}
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label>X1</label>
        <FormNumberInput
          value={vertexOne.get("x")}
          onChange={(event) => onUpdate("vertexOne", { x: event.target.value })}
          style={inputStyle}
          state={state}
          precision={2}
          {...rest}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label>Y1</label>
        <FormNumberInput
          value={vertexOne.get("y")}
          onChange={(event) => onUpdate("vertexOne", { y: event.target.value })}
          style={inputStyle}
          state={state}
          precision={2}
          {...rest}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label>X2</label>
        <FormNumberInput
          value={vertexTwo.get("x")}
          onChange={(event) => onUpdate("vertexTwo", { x: event.target.value })}
          style={inputStyle}
          state={state}
          precision={2}
          {...rest}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label>Y2</label>
        <FormNumberInput
          value={vertexTwo.get("y")}
          onChange={(event) => onUpdate("vertexTwo", { y: event.target.value })}
          style={inputStyle}
          state={state}
          precision={2}
          {...rest}
        />
      </div>

      <PropertyLengthMeasure
        value={lineLength}
        onUpdate={(mapped) => onUpdate("lineLength", mapped)}
        configs={{
          label: translator.t("Length"),
          min: 0,
          max: Infinity,
          precision: 2,
        }}
        state={state}
      />
    </div>
  );
};

LineAttributesEditor.propTypes = {
  element: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onValid: PropTypes.func,
  attributeFormData: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

export default LineAttributesEditor;
