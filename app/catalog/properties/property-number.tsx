"use client";

import React from "react";
import { FormLabel, FormNumberInput } from "../../components/style/export";
import PropertyStyle from "./shared-property-style";

interface PropertyNumberConfigs {
  label: string;
  min?: number;
  max?: number;
  hook?: (
    val: number,
    sourceElement: any,
    internalState: any,
    state: any
  ) => Promise<number>;
}

interface PropertyNumberProps {
  value: any;
  onUpdate: (val: number) => void;
  onValid?: () => void;
  configs: PropertyNumberConfigs;
  sourceElement?: any;
  internalState?: any;
  state: any;
}

export default function PropertyNumber({
  value,
  onUpdate,
  onValid,
  configs,
  sourceElement,
  internalState,
  state,
}: PropertyNumberProps) {
  let update = (val: string | number) => {
    let number = parseFloat(val as string);

    if (isNaN(number)) {
      number = 0;
    }

    if (configs.hook) {
      return configs
        .hook(number, sourceElement, internalState, state)
        .then((_val) => {
          return onUpdate(_val);
        });
    }

    return onUpdate(number);
  };
  return (
    <table className="PropertyNumber" style={PropertyStyle.tableStyle}>
      <tbody>
        <tr>
          <td style={PropertyStyle.firstTdStyle}>
            <FormLabel>{configs.label}</FormLabel>
          </td>
          <td>
            <FormNumberInput
              value={value}
              onChange={(value: number) => {
                update(value);
              }}
              onValid={onValid}
              min={configs.min}
              max={configs.max}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
