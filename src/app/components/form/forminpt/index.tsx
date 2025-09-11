"use client";
import React, { JSX } from "react";

interface FormInputProps {
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "search"
    | "time"
    | "file";
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  inputTable?: string;
  labelCls?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  id,
  name,
  value,
  onChange,
  onKeyDown,
  label,
  placeholder,
  disabled,
  required,
  readonly,
  inputTable,
  labelCls,
  className,
}): JSX.Element => {
  return (
    <div
      className={`w-full ${
        className || ""
      } flex flex-col sm:flex-row sm:items-center gap-2`}
    >
      {label && (
        <label
          htmlFor={id}
          className={`${labelCls} mb-1 sm:mb-0 sm:mr-1  whitespace-nowrap`}
        >
          {label}
        </label>
      )}
      <input
        className={`border outline-none border-[#aaaaaa] rounded px-3 py-1.5 w-full max-w-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputTable}`}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        readOnly={readonly}
      />
    </div>
  );
};

export default FormInput;
