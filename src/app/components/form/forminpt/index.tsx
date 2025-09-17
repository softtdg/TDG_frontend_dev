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
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  inputTable?: string;
  labelCls?: string;
  className?: string;
  inputClass?: string;
}

const hideNumberArrowsStyle: React.CSSProperties = {
  // Chrome, Safari, Edge, Opera
  appearance: "textfield",
  MozAppearance: "textfield",
  WebkitAppearance: "none",
};

const FormInput: React.FC<FormInputProps> = ({
  type,
  id,
  name,
  value,
  onChange,
  onKeyDown,
  onWheel,
  label,
  placeholder,
  disabled,
  required,
  readonly,
  inputTable,
  labelCls,
  className,
  inputClass,
}): JSX.Element => {
  // Default wheel handler for number inputs to prevent scroll wheel from changing values
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === "number") {
      e.preventDefault();
      e.currentTarget.blur(); // Remove focus to prevent accidental changes
    }
    // Call custom onWheel handler if provided
    if (onWheel) {
      onWheel(e);
    }
  };

  // Hide number input arrows for type="number"
  const numberInputStyle =
    type === "number"
      ? {
          ...hideNumberArrowsStyle,
          // Hide arrows for Firefox
          MozAppearance: "textfield",
        }
      : {};

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
        className={` ${inputClass} border outline-none border-[#aaaaaa] rounded px-3 py-1.5 w-full max-w-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputTable}`}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onWheel={handleWheel}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        readOnly={readonly}
        style={numberInputStyle}
        // Hide arrows for Chrome, Safari, Edge, Opera
        {...(type === "number"
          ? {
              inputMode: "decimal",
              pattern: "[0-9]*",
              // The following are for hiding arrows in Chrome/Edge/Safari
              // but since React doesn't support pseudo-elements, we use style above
            }
          : {})}
      />
      {/* Hide number input arrows for Chrome, Safari, Edge, Opera */}
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default FormInput;
