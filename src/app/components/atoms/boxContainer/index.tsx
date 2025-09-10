import { box1fld, box2fld, box3fld, box4fld, box5fld } from "@/app/utils/const";
import React from "react";

const BoxContainer = ({ data }: { data: string[] }) => {
  const getDisplayValue = (path: string, obj: any) => {
    if (!path || !obj) return "—";

    try {
      const value = path.split(".").reduce((acc, key) => {
        if (Array.isArray(acc)) {
          acc = acc[0]; // Always take the first element if it's an array
        }
        return acc?.[key];
      }, obj);

      // if value is undefined or null, return empty string
      if (value === undefined || value === null) return "";

      // if value is 0001-01-01T00:00:00.000Z, return *
      if (value === "0001-01-01T00:00:00.000Z") return "*";

      if (Array.isArray(value)) return value.join(", ");

      // Check if value is a date string (simple ISO check) 2023-07-25T14:30:00
      if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
      ) {
        // Format the date as "DD/MM/YYYY" (customize as needed)
        const date = new Date(value);
        return date.toLocaleDateString("en-US"); // or use 'en-US' for MM/DD/YYYY
      }

      return String(value);
    } catch (error) {
      // console.error('Error getting display value for path:', path, error);
    }
  };

  const boxBgColors = [
    "bg-white",
    "bg-[#FFCCCC]",
    "bg-[#99CCFF]",
    "bg-[#f0e68c]",
    "bg-[#DAF7A6]",
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex w-full ">
        {[box1fld, box2fld, box3fld, box4fld, box5fld].map(
          (boxFields, boxIndex) => (
            <div
              key={boxIndex}
              className={`w-1/5 border border-[#000] ${boxBgColors[boxIndex]}`}
            >
              {boxFields.map((field, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-start border-b border-b-[#8f9295] p-3 last:border-b-0`}
                >
                  <div className="font-semibold text-left w-1/2 pr-2 text-sm">
                    <span className="font-semibold">{field.label}</span>
                  </div>
                  <div className="text-left w-1/2 break-words text-sm">
                    {(() => {
                      const displayValue = getDisplayValue(field.key, data);
                      // Additional safety check to ensure we never render objects
                      if (
                        typeof displayValue === "object" &&
                        displayValue !== null
                      ) {
                        console.warn(
                          "Object detected in display value:",
                          displayValue
                        );
                        return "—";
                      }
                      return displayValue;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BoxContainer;
