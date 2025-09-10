"use client";
import React, { JSX } from "react";

interface FormButtonProps {
  btnName: string | React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  url?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const FormButton: React.FC<FormButtonProps> = ({
  btnName,
  onClick,
  className,
  url,
  disabled,
  icon,
}): JSX.Element => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (url) {
      window.open(url, "_blank");
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 text-base font-bold border p-2 rounded-xl outline-none cursor-pointer ${className}`}
    >
      {icon}
      {btnName}
    </button>
  );
};

export default FormButton;
