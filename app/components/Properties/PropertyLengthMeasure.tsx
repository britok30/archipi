"use client";

import React from "react";
import convert from "convert-units";
import {
  UNITS_LENGTH,
  UNIT_CENTIMETER,
} from "../../../lib/floorplan-utils/constants";
import { FormNumberInput } from "../FormNumberInput";
import { toFixedFloat } from "../../../lib/floorplan-utils/math";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LengthValue {
  length: number;
  _length?: number;
  _unit?: string;
  [key: string]: any;
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
      state?: object,
    ) => Promise<LengthValue>;
    label: string;
    [key: string]: any;
  };
  sourceElement?: object;
  internalState?: object;
  state?: object;
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
  const length = value?.length || 0;
  const _length = value?._length ?? length;
  const _unit = value?._unit || UNIT_CENTIMETER;
  const { hook, label } = configs;

  const emit = async (merged: LengthValue) => {
    if (hook) {
      const val = await hook(merged, sourceElement, internalState, state);
      return onUpdate(val);
    }
    return onUpdate(merged);
  };

  // The user typed a new displayed length in the current unit: convert to cm.
  const updateLength = (lengthInput: number) => {
    const newLength = toFixedFloat(lengthInput);
    return emit({
      ...value,
      length:
        _unit !== UNIT_CENTIMETER
          ? convert(newLength)
              .from(_unit as typeof UNIT_CENTIMETER)
              .to(UNIT_CENTIMETER)
          : newLength,
      _length: lengthInput,
      _unit,
    });
  };

  // The user switched units: keep the stored cm value fixed and only
  // recompute the displayed length in the new unit.
  const updateUnit = (unitInput: string) => {
    return emit({
      ...value,
      length,
      _length: toFixedFloat(
        convert(length)
          .from(UNIT_CENTIMETER)
          .to(unitInput as typeof UNIT_CENTIMETER),
      ),
      _unit: unitInput,
    });
  };

  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-4">
      <Label className="text-xs text-muted-foreground capitalize">{label}</Label>
      <div className="flex gap-2">
        <FormNumberInput
          className="flex-1 min-w-0"
          value={_length}
          onChange={(value: number) => updateLength(value)}
        />
        <Select value={_unit} onValueChange={(value) => updateUnit(value)}>
          <SelectTrigger
            className="h-9 w-[4.25rem] shrink-0"
            aria-label={`${label} unit`}
          >
            <SelectValue placeholder="Unit" />
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
  );
};

export default PropertyLengthMeasure;
