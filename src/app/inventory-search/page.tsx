"use client";
import React, { useState, useEffect } from "react";
import FormInput from "../components/form/forminpt";
import LogoutButton from "@/app/components/LogoutButton";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
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
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
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
        date: new Date(sop.requestedOn).toLocaleDateString(),
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

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    {
      field: "sopMpf",
      headerName: "SOP/MPF",
      flex: 1,
      sortable: true,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
    {
      field: "SOPNumber",
      headerName: "SOP#",
      flex: 1,
      sortable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
    {
      field: "totalQty",
      headerName: "QTY needed",
      flex: 1,
      sortable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.row.sopMpf === "SOP" ? params.value || "-" : "-"}
        </div>
      ),
    },
    {
      field: "qtyToPick",
      headerName: "Qty Picked",
      flex: 1,
      sortable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
    {
      field: "comments",
      headerName: "Comment",
      flex: 2,
      sortable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
    {
      field: "requestedBy",
      headerName: "Requested by",
      flex: 1.5,
      sortable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      sortable: true,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      renderCell: (params) => (
        <div className="text-center text-sm font-medium">
          {params.value || "-"}
        </div>
      ),
    },
  ];

  return (
    <div>
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
            <p className="text-red-500 mb-4">{error}</p>
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
                <div style={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={processTableData(searchResults.data.allSops).map(
                      (row, index) => ({
                        ...row,
                        id: index, // DataGrid requires unique id for each row
                      })
                    )}
                    columns={columns}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    sx={{
                      border: "1px solid #000000",
                      borderRadius: "8px",
                      overflow: "hidden",
                      fontFamily:
                        "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#113d5a !important",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily:
                          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        // borderBottom: "2px solid #0a2a3e",
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: "600",
                          fontFamily:
                            "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        },
                      },
                      "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "#113d5a !important",
                        borderRight: "1px solid #000000",
                        "&:last-child": {
                          borderRight: "none",
                        },
                        "&.MuiDataGrid-columnHeader--sorted": {
                          backgroundColor: "#0a2a3e",
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        borderRight: "1px solid #000000",
                        borderBottom: "1px solid #000000",
                        fontSize: "16px !important",
                        fontWeight: "500",
                        color: "#333",
                        fontFamily:
                          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:last-child": {
                          borderRight: "none",
                        },
                        "& .text-sm": {
                          fontSize: "15px !important",
                          fontFamily:
                            "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        },
                      },
                      "& .MuiDataGrid-row": {
                        backgroundColor: "white",
                        "&:nth-of-type(even)": {
                          backgroundColor: "#fafafa",
                        },
                        "&:hover": {
                          backgroundColor: "#f0f8ff",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "#e3f2fd",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                          },
                        },
                      },
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: "1px solid #000000",
                        backgroundColor: "#f8f9fa",
                        fontSize: "16px !important",
                        fontFamily:
                          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      },
                      "& .MuiDataGrid-toolbarContainer": {
                        // borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "#f8f9fa",
                        padding: "8px 16px",
                      },
                      "& .MuiDataGrid-sortIcon": {
                        color: "white",
                      },
                      "& .MuiDataGrid-menuIcon": {
                        color: "white",
                      },
                      "& .MuiDataGrid-menuIconButton": {
                        color: "white !important",
                      },
                      "& .MuiIconButton-sizeSmall": {
                        color: "white !important",
                      },
                    }}
                  />
                </div>
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
