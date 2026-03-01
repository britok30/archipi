"use client";

import React from "react";

export interface FormTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FormTextInput: React.FC<FormTextInputProps> = ({ className = "", ...rest }) => {
  return (
    <input
      className={`bg-secondary w-full text-foreground border border-border rounded-md h-[40px] px-3 outline-none focus:ring-1 focus:ring-ring ${className}`}
      type="text"
      {...rest}
    />
  );
};

export default FormTextInput;
