"use client";

import { FormNumberInput } from "../FormNumberInput";
import { Label } from "@/components/ui/label";

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
    <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
      <Label className="text-xs capitalize">{configs.label}</Label>
      <FormNumberInput
        value={value}
        onChange={(value: number) => {
          update(value);
        }}
        onValid={onValid}
        min={configs.min}
        max={configs.max}
      />
    </div>
  );
}
