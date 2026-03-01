"use client";

import React from "react";
import { FormLabel } from "../../components/style/export";
import PropertyStyle from "./shared-property-style";

interface PropertyCheckboxConfigs {
  label: string;
  hook?: (
    val: boolean,
    sourceElement: any,
    internalState: any,
    state: any
  ) => Promise<boolean>;
}

interface PropertyCheckboxProps {
  value: boolean;
  onUpdate: (val: boolean) => void;
  configs: PropertyCheckboxConfigs;
  sourceElement?: any;
  internalState?: any;
  state: any;
}

export default function PropertyCheckbox({
  value,
  onUpdate,
  configs,
  sourceElement,
  internalState,
  state,
}: PropertyCheckboxProps) {
  let update = (val: boolean) => {
    if (configs.hook) {
      return configs
        .hook(val, sourceElement, internalState, state)
        .then((_val) => {
          return onUpdate(_val);
        });
    }

    return onUpdate(val);
  };

  return (
    <table className="PropertyCheckbox" style={PropertyStyle.tableStyle}>
      <tbody>
        <tr>
          <td style={PropertyStyle.firstTdStyle}>
            <FormLabel>{configs.label}</FormLabel>
          </td>
          <td>
            <input
              style={{ margin: 0 }}
              type="checkbox"
              checked={value}
              onChange={(e) => update(!value)}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
