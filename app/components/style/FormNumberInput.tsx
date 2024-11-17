"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input"; // Adjust the import path as needed

interface FormNumberInputProps {
  /**
   * ID for the input element.
   */
  id?: string;

  /**
   * The current value of the input, can be a number or string.
   */
  value?: number | string;

  /**
   * The minimum allowed value. Defaults to Number.MIN_SAFE_INTEGER.
   */
  min?: number;

  /**
   * The maximum allowed value. Defaults to Number.MAX_SAFE_INTEGER.
   */
  max?: number;

  /**
   * The number of decimal places to fix the value to. Defaults to 3.
   */
  precision?: number;

  /**
   * Callback function triggered when the input value is valid and confirmed (e.g., on Enter or Blur).
   * Receives the parsed number as its argument.
   */
  onChange: (value: number) => void;

  /**
   * Optional callback function triggered when the input becomes valid.
   */
  onValid?: () => void;

  /**
   * Optional callback function triggered when the input becomes invalid.
   */
  onInvalid?: () => void;

  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;

  /**
   * Additional CSS classes to apply to the input component.
   */
  className?: string;
}

const FormNumberInput: React.FC<FormNumberInputProps> = ({
  id,
  value,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  precision = 3,
  onChange,
  onValid,
  onInvalid,
  placeholder,
  className = "",
}) => {
  // State to manage the input's current value as a string
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "");

  // Ref to access the input element directly
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Effect to synchronize the internal input value with external `value` prop,
   * ensuring it respects the `min` and `max` constraints.
   */
  useEffect(() => {
    let newValue = value?.toString() || "";
    const parsedValue = parseFloat(newValue);

    if (!isNaN(parsedValue)) {
      if (parsedValue < min) {
        newValue = min.toString();
      } else if (parsedValue > max) {
        newValue = max.toString();
      }
    }

    setInputValue(newValue);
  }, [value, min, max]);

  /**
   * Handler for input value changes.
   * Updates the internal state and triggers validation callbacks.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = e.target;
    setInputValue(newValue);

    const parsedValue = parseFloat(newValue);
    const isValid =
      newValue === "" ||
      (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max);

    if (isValid) {
      onValid && onValid();
      onInvalid && onInvalid(); // Optionally, you can adjust when to call onInvalid
    } else {
      onInvalid && onInvalid();
    }
  };

  /**
   * Handler for confirming the input value.
   * Triggered on Enter key press or when the input loses focus.
   */
  const confirmValue = () => {
    const parsedValue = parseFloat(inputValue);

    if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
      const fixedValue = parseFloat(parsedValue.toFixed(precision));
      onChange(fixedValue);
      onValid && onValid();
    } else {
      onInvalid && onInvalid();
      // Optionally, reset to the last valid value
      setInputValue(value?.toString() || "");
    }
  };

  /**
   * Handler for key down events.
   * Confirms the value on Enter key press.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      confirmValue();
      // Optionally, move focus to the next input or element
      // e.target.blur();
    }
  };

  /**
   * Handler for when the input loses focus.
   * Confirms the value.
   */
  const handleBlur = () => {
    confirmValue();
  };

  return (
    <Input
      id={id}
      type="number"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      aria-invalid={
        inputValue === "" ||
        isNaN(parseFloat(inputValue)) ||
        parseFloat(inputValue) < min ||
        parseFloat(inputValue) > max
      }
      className={className}
      min={min}
      max={max}
      step={Math.pow(10, -precision)}
      ref={inputRef}
    />
  );
};

export default FormNumberInput;
