// import * as React from 'react';

// interface DropdownListProps {
//     options?: Array<{ value: string; label: React.ReactNode }>;
//     value?: string;
//     onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
//     label?: React.ReactNode;
//     className?: string
// }

// const DropdownList: React.FC<DropdownListProps> = ({ options, value, onChange, label, className }) => {
//     return (
//         <div className=''>
//             <label className='pt-3 pb-3'>
//                 {label}
//             </label>
//             <select
//                 value={value || ''}
//                 // label={label}
//                 onChange={onChange}
//                 className={`flex border border-[#aaaaaa] px-8 py-1.5 rounded-md outline-none font-bold`}>
//                 {/* <option value="" disabled><em>None</em></option> */}
//                 {Array.isArray(options) && options.map((option) => (
//                     <option key={option.value} value={option.value}>
//                         {option.label}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// }

// export default DropdownList;

import React, { useState } from "react";

interface OptionType {
  value: string;
  label: React.ReactNode;
}

interface DropdownListProps {
  options?: OptionType[];
  value?: string;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  className?: string;
}

const DropdownList: React.FC<DropdownListProps> = ({
  options = [],
  value,
  onChange,
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-64 ${className || ""}`}>
      {label && (
        <label className="block mb-2 font-semibold text-[#113d5a]">
          {label}
        </label>
      )}

      <div
        className="border border-[#aaaaaa] px-4 py-2 rounded-md cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOption?.label || "Select..."}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div className="p-2" key={option.value}>
              <div
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border border-gray-500 rounded-xl"
              >
                {option.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownList;
