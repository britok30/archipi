"use client";

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

export default function FormNumberInput({
  value,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  precision = 3,
  onChange,
  onValid,
  onInvalid,
  placeholder,
  className = "",
}) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);

  const regexp = useMemo(
    () => new RegExp(`^-?([0-9]+)?\\.?([0-9]{0,${precision}})?$`),
    [precision]
  );

  useEffect(() => {
    let newValue = value.toString();
    if (!isNaN(min) && isFinite(min) && parseFloat(newValue) < min) {
      newValue = min.toString();
    }
    if (!isNaN(max) && isFinite(max) && parseFloat(newValue) > max) {
      newValue = max.toString();
    }
    setInputValue(newValue);
  }, [value, min, max]);

  const handleInputChange = (e) => {
    const { value: newValue } = e.target;
    const isValid = regexp.test(newValue);

    setIsValid(isValid);
    setInputValue(newValue);

    if (isValid) {
      if (onValid) onValid(e);
    } else {
      if (onInvalid) onInvalid(e);
    }
  };

  const handleKeyDown = (e) => {
    const { key } = e;
    if ((key === "Enter" || key === "Tab") && isValid) {
      let finalValue = parseFloat(inputValue).toFixed(precision);
      if (onChange) {
        onChange({ target: { value: finalValue } });
      }
    }
  };

  return (
    <input
      type="text"
      className={`bg-[#292929] text-white border-none rounded-md h-[40px] px-3 outline-none ${className}`}
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
}

FormNumberInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  onValid: PropTypes.func,
  onInvalid: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  precision: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

FormNumberInput.defaultProps = {
  className: "",
};
