"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
      <Label className="text-xs capitalize">{configs.label}</Label>
      <Switch checked={value} onCheckedChange={update} />
    </div>
  );
}
