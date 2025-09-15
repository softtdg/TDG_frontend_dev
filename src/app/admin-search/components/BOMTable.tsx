"use client";
import React from "react";

interface BOMItem {
  id: number;
  group: string;
  level: string;
  tdgPn: string;
  description: string;
  rmPn: string;
  diePn: string;
  quantity: string;
  size: string;
  uom: string;
  material: string;
  finish: string;
  vendor: string;
  vendorPn: string;
  state: string;
  fileName: string;
  configuration: string;
  type: string;
}

interface BOMTableProps {
  bomData: BOMItem[];
}

const BOMTable: React.FC<BOMTableProps> = ({ bomData }) => {
  return (
    <div className="p-3 mt-6">
      <div className="overflow-x-auto max-h-[calc(100vh-50px)] overflow-y-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-[#39495f] sticky top-[0px] z-10">
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Group
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Level
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                TDG PN
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Description
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                RM PN
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px] md:whitespace-nowrap">
                Die PN
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Quantity
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Size
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                UOM
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Material
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Finish
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Vendor
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Vendor PN
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                State
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                FileName
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Configuration
              </th>
              <th className="border border-gray-500 px-2 py-3 text-left font-semibold text-[#ffffff] text-sm min-w-[80px]">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {bomData.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  item.level === "17.1" ||
                  item.level === "18.1" ||
                  item.level === "19"
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "bg-white"
                }`}
              >
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium text-gray-800">
                  {item.group}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium text-gray-800">
                  {item.level}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium">
                  {item.tdgPn}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-700 leading-relaxed">
                  {item.description}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {item.rmPn || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600">
                  {item.diePn || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-semibold text-gray-800">
                  {item.quantity}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600">
                  {item.size}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium text-gray-700 whitespace-nowrap">
                  {item.uom}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600">
                  {item.material || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600">
                  {item.finish || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium text-gray-700">
                  {item.vendor}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600">
                  {item.vendorPn || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px]">
                  {item.state || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] text-gray-600 font-mono">
                  {item.fileName || "-"}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-medium text-gray-700">
                  {item.configuration}
                </td>
                <td className="border border-gray-500 px-2 py-2 text-[13px] font-bold text-gray-800">
                  {item.type || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BOMTable;
