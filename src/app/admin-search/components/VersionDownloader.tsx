"use client";
import React from "react";

interface VersionItem {
  version: number;
  state: string;
  action: string;
}

interface VersionDownloaderProps {
  versionData: VersionItem[];
}

const VersionDownloader: React.FC<VersionDownloaderProps> = ({
  versionData,
}) => {
  return (
    <div className="p-3">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Version Downloader:
      </h2>
      <div className="max-w-[800px] max-h-64 overflow-auto border border-gray-400">
        <table className="border-collapse w-[100%]">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-sm">
                Version
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-sm">
                State
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-[black] text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {versionData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-400 px-2 py-1 text-sm font-medium">
                  {item.version}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-sm">
                  {item.state}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-sm">
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          item.action === "download"
                            ? "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        }
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VersionDownloader;
