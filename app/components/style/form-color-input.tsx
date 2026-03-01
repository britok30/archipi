"use client";

import React from "react";
import FormTextInput, { FormTextInputProps } from "./form-text-input";

const STYLE: React.CSSProperties = {
  padding: 0,
  border: 0,
};
const EREG_NUMBER = /^.*$/;

interface FormColorInputProps extends Omit<FormTextInputProps, 'type'> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormColorInput({ onChange, ...rest }: FormColorInputProps) {
  const onChangeCustom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (EREG_NUMBER.test(value)) {
      onChange(event);
    }
  };

  return (
    <FormTextInput
      type="color"
      style={STYLE}
      onChange={onChangeCustom}
      autoComplete="off"
      {...rest}
    />
  );
}
