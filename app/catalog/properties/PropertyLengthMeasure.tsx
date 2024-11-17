"use client";

import React from "react";
import { Map } from "immutable";
import convert from "convert-units";
import { UNITS_LENGTH, UNIT_CENTIMETER } from "../../utils/constants";
import {
  FormLabel,
  FormNumberInput,
  FormSelect,
} from "../../components/style/export";
import { toFixedFloat } from "../../utils/math";
import PropertyStyle from "./shared-property-style";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";

interface LengthValue extends Map<string, any> {
  get(key: "length"): number;
  get(key: "_length"): number;
  get(key: "_unit"): string;
  merge(obj: object): LengthValue;
}

interface PropertyLengthMeasureProps {
  value: LengthValue;
  onUpdate: (value: LengthValue) => void;
  onValid?: (value: boolean) => void;
  configs: {
    hook?: (
      value: LengthValue,
      sourceElement?: object,
      internalState?: object,
      state?: object
    ) => Promise<LengthValue>;
    label: string;
    [key: string]: any;
  };
  sourceElement?: object;
  internalState?: object;
  state: object;
}

const PropertyLengthMeasure: React.FC<PropertyLengthMeasureProps> = ({
  value,
  onUpdate,
  onValid,
  configs,
  sourceElement,
  internalState,
  state,
}) => {
  const length = value.get("length") || 0;
  const _length = value.get("_length") || length;
  const _unit = value.get("_unit") || UNIT_CENTIMETER;
  const { hook, label, ...configRest } = configs;

  const update = async (lengthInput: number, unitInput: string) => {
    const newLength = toFixedFloat(lengthInput);
    const merged = value.merge({
      length:
        unitInput !== UNIT_CENTIMETER
          ? convert(newLength)
              .from(unitInput as typeof UNIT_CENTIMETER)
              .to(UNIT_CENTIMETER)
          : newLength,
      _length: lengthInput,
      _unit: unitInput,
    });

    if (hook) {
      const val = await hook(merged, sourceElement, internalState, state);
      return onUpdate(val);
    }

    return onUpdate(merged);
  };

  return (
    <div
      className="property-length-measure flex flex-col gap-2 mb-2"
      style={PropertyStyle.containerStyle}
    >
      <div className="flex flex-col">
        <Label className="text-xs mb-2 capitalize">{label}</Label>

        <div className="flex gap-3">
          <FormNumberInput
            className="flex-1"
            value={_length}
            onChange={(value: number) => update(value, _unit)}
          />

          <Select
            value={_unit}
            onValueChange={(value) => update(_length, value)}
          >
            <SelectTrigger className="w-[50px] border rounded-lg">
              <SelectValue placeholder="Choose a unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS_LENGTH.map((el) => (
                <SelectItem key={el} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PropertyLengthMeasure;
