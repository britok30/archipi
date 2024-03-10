"use client";

import React, { Component } from "react";

const FormTextInput = (props) => {
  const { className = "", ...rest } = props;

  return (
    <input
      className={`bg-[#292929] w-full text-white border-none rounded-md h-[40px] px-3 outline-none ${className}`}
      type="text"
      {...rest}
    />
  );
};

export default FormTextInput;
