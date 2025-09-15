"use client";
import React from "react";

interface FixtureHeaderProps {
  fixtureId: string;
  franceRequirement: boolean;
  onToggleFranceRequirement: () => void;
}

const FixtureHeader: React.FC<FixtureHeaderProps> = ({
  fixtureId,
  franceRequirement,
  onToggleFranceRequirement,
}) => {
  return (
    <div className="bg-white text-gray-900 p-3 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-center">
        <div className="flex-1">
          <h1 className="text-[22px] font-semibold mb-1">
            Fixture: {fixtureId}
          </h1>
          <button
            onClick={onToggleFranceRequirement}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors font-medium cursor-pointer text-xs sm:text-sm ${
              franceRequirement
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            France Requirement: {franceRequirement ? "True" : "False"}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-sm">
            Open Pick List
          </button>
          <button className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-sm">
            Open Live BOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixtureHeader;
