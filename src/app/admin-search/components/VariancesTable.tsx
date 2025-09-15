"use client";
import React from "react";

interface VarianceData {
  pdm: {
    tdgPn: string;
    level: string;
    quantity: string;
    vendor: string;
    vendorPn: string;
    rmPn: string;
    diePn: string;
    size: string;
  };
  excel: {
    tdgPn: string;
    level: string;
    quantity: string;
    vendor: string;
    vendorPn: string;
    rmPn: string;
    diePn: string;
    size: string;
  };
}

interface VariancesTableProps {
  variancesData: VarianceData[];
}

const VariancesTable: React.FC<VariancesTableProps> = ({ variancesData }) => {
  return (
    <div className="p-3">
      <h2 className="text-[25px] font-bold text-gray-800 mb-3 text-center">
        Variances
      </h2>
      <h3 className="text-lg font-semibold text-[black] mb-3 text-center">
        PDM Aggregate Quantities vs Excel Aggregate Quantities
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM TDG PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Level
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Quantity
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Vendor
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Vendor PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM RM PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Die PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                PDM Size
              </th>
              <th className="px-6 py-2 bg-white"></th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel TDG PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Level
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Quantity
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Vendor
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Vendor PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel RM PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Die PN
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-xs">
                Excel Size
              </th>
            </tr>
          </thead>
          <tbody>
            {variancesData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.tdgPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.level}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.quantity}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.vendor}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.vendorPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.rmPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.diePn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.pdm.size}
                </td>
                <td className="px-6 py-1 bg-white"></td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.tdgPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.level}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.quantity}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.vendor}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.vendorPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.rmPn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.diePn}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs">
                  {item.excel.size}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium cursor-pointer text-sm">
          Download BOM in Excel
        </button>
      </div>
    </div>
  );
};

export default VariancesTable;
