"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchForm,
  FixtureHeader,
  FixtureComparisonTable,
  VersionDownloader,
  VariancesTable,
  BOMTable,
} from "./components";
import {
  versionData,
  variancesData,
  bomData,
  fixtureData,
  historyData,
} from "./data/mockData";

const AdminSearchPage = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [franceRequirement, setFranceRequirement] = useState<boolean>(false);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  const performSearch = () => {
    if (searchValue.trim()) {
      setShowResults(true);
    }
  };

  const toggleFranceRequirement = () => {
    setFranceRequirement(!franceRequirement);
  };

  const handleQuantityChanges = (changes: string) => {
    if (changes !== "No Quantity Changes") {
      // Handle quantity changes display
      console.log("Show quantity changes:", changes);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Search Form */}
      <SearchForm
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onKeyDown={handleKeyDown}
      />

      {/* Results Section */}
      {showResults && (
        <div className="p-2 max-w-[1900px] mx-auto">
          <div className="bg-white overflow-hidden">
            {/* Header Section */}
            <FixtureHeader
              fixtureId={fixtureData.fixtureId}
              franceRequirement={franceRequirement}
              onToggleFranceRequirement={toggleFranceRequirement}
            />

            {/* Main Data Table */}
            <FixtureComparisonTable
              fixtureData={fixtureData}
              historyData={historyData}
              onQuantityChanges={handleQuantityChanges}
            />
          </div>

          {/* Version Downloader Section */}
          <VersionDownloader versionData={versionData} />

          {/* Variances Section */}
          <VariancesTable variancesData={variancesData} />

          {/* BOM Table Section */}
          <BOMTable bomData={bomData} />
        </div>
      )}

      {/* No Results State */}
      {!showResults && (
        <div className="text-center text-gray-500 py-8">
          Enter a fixture ID or part number above to search
        </div>
      )}
    </div>
  );
};

export default AdminSearchPage;
