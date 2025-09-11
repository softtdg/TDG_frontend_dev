"use client";
import React, { useState, useEffect } from "react";
import FormInput from "../components/form/forminpt";
import LogoutButton from "@/app/components/LogoutButton";
import Table from "../components/atoms/table";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  searchInventory,
  clearSearchResults,
  clearError,
} from "@/app/store/slices/inventorySearchSlice";

const InventorySearchPage = () => {
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const { loading, error, searchResults, hasSearched }: any = useAppSelector(
    (state) => state.inventorySearch
  );

  const handleInventorySearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInventorySearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  const performSearch = async () => {
    if (!inventorySearch.trim()) {
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    // Dispatch the search action
    dispatch(searchInventory({ partNumber: inventorySearch.trim() }));
  };

  // Handle Redux state changes
  useEffect(() => {
    if (error) {
      console.error("Search error:", error);
    }
  }, [error]);

  // Process data to create separate rows for SOP and MPF entries
  const processTableData = (allSops: any[]) => {
    const tableData: any[] = [];

    allSops.forEach((sop: any) => {
      // Add SOP row
      tableData.push({
        ...sop,
        sopMpf: "SOP",
        requestedBy: "",
        date: "",
      });

      // Add MPF rows if they exist
      if (sop.mpf && sop.mpf.length > 0) {
        sop.mpf.forEach((mpfEntry: any) => {
          tableData.push({
            ...sop,
            sopMpf: "MPF",
            qtyToPick: mpfEntry.qtyToPick,
            comments: mpfEntry.comments,
            requestedBy: mpfEntry.requestedBy,
            date: new Date(mpfEntry.requestedOn).toLocaleDateString(),
          });
        });
      }
    });

    return tableData;
  };

  // Table columns configuration matching the image format
  const tableColumns = [
    {
      dataField: "sopMpf",
      text: "sop/mpf",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
    {
      dataField: "SOPNumber",
      text: "sop#",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
    {
      dataField: "totalQty",
      text: "QTY needed",
      headerClasses: "text-center",
      formatter: (cell: any, row: any) => (
        <div className="text-center text-base font-semibold">
          {row.sopMpf === "SOP" ? cell || "-" : "-"}
        </div>
      ),
    },
    {
      dataField: "qtyToPick",
      text: "Qty Picked",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
    {
      dataField: "comments",
      text: "comment",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
    {
      dataField: "requestedBy",
      text: "Requested by",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
    {
      dataField: "date",
      text: "Date",
      headerClasses: "text-center",
      formatter: (cell: any) => (
        <div className="text-center text-base font-semibold">{cell || "-"}</div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="relative grid grid-cols-3 items-center p-4 border-b border-b-[#dee2e6]">
        <div></div>

        <div className="text-center">
          <span className="text-4xl font-bold">TDG</span>
        </div>

        <div className="flex justify-end">
          <LogoutButton className="cursor-pointer border border-[#ddd] rounded-xl px-2.5 py-1.5 bg-transparent hover:bg-gray-50 text-black font-normal">
            Logout
          </LogoutButton>
        </div>
      </div>

      {/* Menu Options */}
      {/* <div className="p-4 border-b border-b-[#dee2e6]">
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium mr-4"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push("/inventory-search")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Inventory Search
          </button>
        </div>
      </div> */}

      {/* Search Form */}
      <div className="p-2 pt-5.5 flex justify-center items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
          <div className="w-full">
            <FormInput
              type="text"
              label="Inventory Search"
              labelCls="pr-0 sm:pr-5"
              value={inventorySearch}
              onChange={handleInventorySearchChange}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Search Results Area */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center pt-10">
            <BeatLoader />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error}</p>
          </div>
        ) : hasSearched ? (
          <div>
            {searchResults?.data?.allSops &&
            searchResults.data.allSops.length > 0 ? (
              <div>
                <div className="mb-4 text-center">
                  {/* <p className="text-sm text-gray-600">
                    TDGPN:{" "}
                    <span className="font-semibold">
                      {searchResults.data.TDGPN}
                    </span>
                  </p> */}
                </div>
                <Table
                  columns={tableColumns}
                  data={processTableData(searchResults.data.allSops)}
                  className="min-w-full"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No results found for &quot;{inventorySearch}&quot;
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Enter your search term above to find inventory items
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySearchPage;
