"use client";

import React from "react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

export default function FormSelect({ children, ...rest }: FormSelectProps) {
  return (
    <select
      className="bg-secondary text-foreground border border-border rounded-md ml-2 outline-none px-1 py-2.5 w-full block focus:ring-1 focus:ring-ring"
      {...rest}
    >
      {children}
    </select>
  );
}
