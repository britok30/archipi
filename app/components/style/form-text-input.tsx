"use client";

import React from "react";

export interface FormTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FormTextInput: React.FC<FormTextInputProps> = ({ className = "", ...rest }) => {
  return (
    <input
      className={`bg-[#292929] w-full text-white border-none rounded-md h-[40px] px-3 outline-none ${className}`}
      type="text"
      {...rest}
    />
  );
};

export default FormTextInput;
