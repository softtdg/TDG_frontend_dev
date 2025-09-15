"use client";
import React from "react";

interface FixtureData {
  storedFixture: {
    componentsVisibleWhenUsedAsSubAssembly: boolean;
    revision: string;
    version: string;
    state: string;
    bomType: string;
    selectedConfiguration: string;
    pdmFileId: string;
    numberOfLines: string;
  };
  pdmFixture: {
    componentsVisibleWhenUsedAsSubAssembly: string;
    revision: string;
    version: string;
    state: string;
    bomType: string;
    selectedConfiguration: string;
    pdmFileId: string;
    numberOfLines: string;
  };
}

interface HistoryItem {
  version: string;
  user: string;
  changeDate: string;
  changeComments: string;
  quantityChanges: string;
}

interface FixtureComparisonTableProps {
  fixtureData: FixtureData;
  historyData: HistoryItem[];
  onQuantityChanges: (changes: string) => void;
}

const FixtureComparisonTable: React.FC<FixtureComparisonTableProps> = ({
  fixtureData,
  historyData,
  onQuantityChanges,
}) => {
  return (
    <div className="p-2 sm:p-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-400 min-w-[600px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 sm:p-2 text-left font-semibold text-[black] text-xs sm:text-sm"></th>
              <th className="border border-gray-400 p-1 sm:p-2 text-left font-semibold text-[black] text-xs sm:text-[18px]">
                Stored Fixture
              </th>
              <th className="border border-gray-400 p-1 sm:p-2 text-left font-semibold text-[black] text-xs sm:text-[18px]">
                PDM Fixture
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                <span className="hidden sm:inline">
                  Components Visible When Used As Sub Assembly:
                </span>
                <span className="sm:hidden">Components Visible</span>
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture
                  .componentsVisibleWhenUsedAsSubAssembly
                  ? "True"
                  : "False"}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture
                  .componentsVisibleWhenUsedAsSubAssembly || "-"}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                Revision:
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.revision || "-"}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.revision || "-"}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                Version:
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.version}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.version}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                State:
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.state}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.state}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                BOM Type:
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.bomType}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.bomType}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                <span className="hidden sm:inline">
                  Selected Configuration:
                </span>
                <span className="sm:hidden">Configuration</span>
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.selectedConfiguration}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.selectedConfiguration}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                PDM File ID:
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.pdmFileId}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.pdmFileId}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                <span className="hidden sm:inline">Number of Lines:</span>
                <span className="sm:hidden">Lines</span>
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.storedFixture.numberOfLines}
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                {fixtureData.pdmFixture.numberOfLines}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px] max-w-[250px]">
                History:
              </td>
              <td
                className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm"
                colSpan={1}
              >
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-400 text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-2 font-medium text-[black] text-left text-[15px]">
                            Version
                          </th>
                          <th className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-2 font-medium text-[black] text-left text-[15px]">
                            User
                          </th>
                          <th className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-2 font-medium text-[black] text-left text-[15px]">
                            Change Date
                          </th>
                          <th className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-2 font-medium text-[black] text-left text-[15px]">
                            Change Comments
                          </th>
                          <th className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-2 font-medium text-[black] text-left text-[15px]">
                            Quantity Changes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.map((item, index) => (
                          <tr
                            key={index}
                            className="bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <td className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-3 font-medium">
                              {item.version}
                            </td>
                            <td className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-3">
                              {item.user}
                            </td>
                            <td className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-3">
                              {item.changeDate}
                            </td>
                            <td
                              className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-3"
                              title={item.changeComments}
                            >
                              <div className="truncate max-w-[200px]">
                                {item.changeComments}
                              </div>
                            </td>
                            <td className="border border-gray-400 px-1 sm:px-2 py-1 sm:py-3">
                              {item.quantityChanges ===
                              "No Quantity Changes" ? (
                                <span className="text-gray-500 text-xs">
                                  {item.quantityChanges}
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    onQuantityChanges(item.quantityChanges)
                                  }
                                  className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer text-xs"
                                >
                                  {item.quantityChanges}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-400 p-1 sm:p-2 font-medium text-[black] text-xs sm:text-[18px]">
                Actions
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      Scan for New Versions
                    </span>
                    <span className="sm:hidden">Scan New</span>
                  </button>
                  <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      Rescan Last 5 Versions
                    </span>
                    <span className="sm:hidden">Rescan 5</span>
                  </button>
                  <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      Change to Configuration:{" "}
                      {fixtureData.storedFixture.selectedConfiguration}
                    </span>
                    <span className="sm:hidden">Change Config</span>
                  </button>
                </div>
              </td>
              <td className="border border-gray-400 p-1 sm:p-2 text-xs sm:text-sm">
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-xs sm:text-sm w-full sm:w-auto">
                  Use PDM
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixtureComparisonTable;
