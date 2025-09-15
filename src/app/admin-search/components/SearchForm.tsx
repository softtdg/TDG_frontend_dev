"use client";
import React from "react";
import FormInput from "../../components/form/forminpt";

interface SearchFormProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchValue,
  onSearchChange,
  onKeyDown,
}) => {
  return (
    <div className="p-2 pt-4 flex justify-center items-center">
      <div className="flex flex-col items-center gap-2 w-full max-w-lg px-4">
        <div className="w-full">
          <FormInput
            type="text"
            label="Admin Search"
            labelCls="pr-0 sm:pr-5"
            value={searchValue}
            onChange={onSearchChange}
            onKeyDown={onKeyDown}
            className="w-full"
            placeholder="Enter fixture ID or part number"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
