"use client";
import {
  DownloadUpdatedData,
  getBlankPickListData,
  GetFixtureDetails,
  getPickListDataBySop,
} from "@/app/services/fetchData";
import React, { useEffect, useState } from "react";
import FormButton from "../../form/formbutton";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  downloadPickListFile,
  downloadItemPickListFile,
  resetDownloadState,
} from "@/app/store/slices/fileDownloadSlice";
import DropdownList from "../../form/dropdown";
import Table from "../table";
import FormInput from "../../form/forminpt";
import { BarLoader, BeatLoader } from "react-spinners";
import { FiDownload } from "react-icons/fi";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Popover from "@mui/material/Popover";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

// Utility function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("en-GB").format(date);
  } catch (error) {
    return dateString;
  }
};

const PickList = () => {
  const searchParams = useSearchParams();
  const [fixtureNumber, setFixtureNumber] = useState<string>("");
  const [fixtureData, setFixtureData] = useState<any>();
  const [pickList, setPickList] = useState<any>();
  const [selectedsopId, setSelectedSopId] = useState<string>("");
  const [pickListResponse, setPickListResponse] = useState<any>(null);
  console.log("pickListResponse", pickListResponse);
  const [tblLoading, setTblLoading] = useState(false);
  const [inventory, setInventory] = useState(false);
  const [production, setProduction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blankLoading, setblankLoading] = useState(false);
  const [itemLoading, setitemLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [mpfEnabled, setMpfEnabled] = useState(false);
  const [mpfRequestedBy, setMpfRequestedBy] = useState<string>("");
  const [mpfRequestedByError, setMpfRequestedByError] = useState<string>("");

  // const [productionDateOut, setProductionDateOut] = useState<string>("");

  const shouldDisplaySopButtons = () => {
    // Get encoded productionDateOut from URL parameters
    const encodedDate = searchParams.get("pd");
    let prodDateOutFromUrl = "";

    if (encodedDate) {
      try {
        prodDateOutFromUrl = atob(encodedDate);
      } catch (error) {}
    }

    // If productionDateOut is not in URL, check if it's empty or null
    if (!prodDateOutFromUrl) {
      return true; // Show buttons as fallback when no date info
    }

    // Display SOP buttons when productionDateOut is the default date
    const shouldShow = prodDateOutFromUrl === "0001-01-01T00:00:00.000Z";
    return shouldShow;
  };

  // Redux hooks
  const dispatch = useAppDispatch();
  const { error, success, filename } = useAppSelector(
    (state) => state.fileDownload
  );

  // Handle Redux download state changes
  useEffect(() => {
    if (success && filename) {
      dispatch(resetDownloadState());
    }

    if (error) {
      dispatch(resetDownloadState());
    }
  }, [success, error, filename, dispatch]);

  const GetFixtureData = async (fixtureNum: string) => {
    try {
      const response = await GetFixtureDetails(fixtureNum);
      setFixtureData(response.data.data);
    } catch (err) {
      // console.error("Error fetching fixture details:", err)
    }
  };

  useEffect(() => {
    // foe select by default fist SOPLeadHandEntryId
    // if (Array.isArray(fixtureData) && fixtureData.length > 0) {
    //     const firstId = fixtureData[0].SOPLeadHandEntryId
    //     setSelectedSopId(firstId)
    //     picklistData(firstId, "om")prog
    // }

    setSelectedSopId("BlankPickList");
    setPickList([]);
  }, [fixtureData]);

  useEffect(() => {}, [pickList]);

  const handleChnage = async (selectedSop: any) => {
    // const selectedSop = e.target.value;
    setSelectedSopId(selectedSop);
    setTblLoading(true);

    // Reset MPF when changing SOP
    setMpfEnabled(false);
    setMpfRequestedBy("");
    setMpfRequestedByError("");

    try {
      if (selectedSop === "BlankPickList") {
        const response = await getBlankPickListData(fixtureNumber, "om");
        const listData = (response.data.data.listData || []).map(
          (item: any) => ({
            ...item,
            isGrayRow: item.isGray,
          })
        );
        setPickList(listData);
        setPickListResponse(response.data.data);
        // setProductionDateOut("")
      } else {
        const selectFixture = fixtureData.find(
          (item: any) => item.SOPNum === selectedSop
        );
        if (selectedSop) {
          const response = await getPickListDataBySop(
            selectFixture.SOPLeadHandEntryId,
            "om"
          );
          const listData = (response.data.data.listData || []).map(
            (item: any) => ({
              ...item,
              isGrayRow: item.isGray,
            })
          );
          // setPickList(response.data.data.listData || [])
          setPickList(listData);
          setPickListResponse(response.data.data);
        }
      }
    } catch (error) {
      setPickList([]);
      setPickListResponse(null);
    } finally {
      setTblLoading(false);
    }
  };

  const handleDownloadBlankPickList = async (loaderType: "blank" | "full") => {
    if (loaderType === "blank") {
      setblankLoading(true);
    } else {
      setLoading(true);
    }

    try {
      if (!fixtureNumber) {
        return;
      }

      const user = "om"; // Static user name

      // Create payload for Redux action
      const payload = {
        fixtureNumber: fixtureNumber,
        user: user,
      };

      // Dispatch Redux action to download file
      await dispatch(downloadPickListFile(payload));
    } catch (err) {
      // console.error("Error downloading blank pick list:", err);
    } finally {
      if (loaderType === "blank") {
        setblankLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleItemClick = async (
    SOPLeadHandEntryId: string,
    loaderType: "item" | "inventory"
  ) => {
    if (loaderType === "item") {
      setitemLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const user = "om"; // Static user name

      // Create payload for Redux action
      const payload = {
        SOPLeadHandEntryId: SOPLeadHandEntryId,
        user: user,
        // for display file name
        fixtureNumber: fixtureNumber,
      };

      // Dispatch Redux action to download file
      await dispatch(downloadItemPickListFile(payload));
    } catch (err) {
      // console.error("Error downloading item pick list:", err);
    } finally {
      if (loaderType === "item") {
        setitemLoading(true);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Get fixture number and productionDateOut from URL parameters
    const fixtureFromUrl = searchParams.get("fixtureNumber");

    if (fixtureFromUrl) {
      setFixtureNumber(fixtureFromUrl);
      GetFixtureData(fixtureFromUrl);
    }
  }, [searchParams]);

  // const options = [
  //     { label: "Blank Pick List", value: "BlankPickList" },
  //     ...Array.isArray(fixtureData) ? fixtureData.map((item: any) => ({
  //         label: `SOP: ${item.SOPNum} - Date: ${item.ODD} - Qty: ${item.Quantity}`,
  //         value: item.SOPNum
  //     })) : []]

  const options = [
    { label: "Blank Pick List", value: "BlankPickList" },
    ...(Array.isArray(fixtureData)
      ? fixtureData.map((item: any) => ({
          value: item.SOPNum,
          label: (
            <div className="text-sm leading-snug">
              <div className="font-bold text-gray-800">SOP: {item.SOPNum}</div>
              <div className="text-gray-600">Date: {formatDate(item.ODD)}</div>
              <div className="text-gray-600">Qty: {item.Quantity}</div>
            </div>
          ),
        }))
      : []),
  ];

  const measureOptions = [
    { label: "MM", value: "MM" },
    { label: "CM", value: "CM" },
    { label: "M", value: "M" },
    { label: "LBS", value: "LBS" },
    { label: "G", value: "G" },
    { label: "KG", value: "KG" },
    { label: "ML", value: "ML" },
    { label: "L", value: "L" },
    { label: "PCS", value: "PCS" },
  ];

  function getFileNameFromHeader(disposition: any) {
    if (!disposition) return null;
    const match = disposition.match(/filename="(.+)"/);
    return match ? match[1] : null;
  }

  // Helper function to collect all comments from picklist
  const getInventoryComments = () => {
    if (!pickList || pickList.length === 0) return "";

    const comments = pickList
      .filter(
        (item: any) =>
          !item.isGrayRow && item.Comments && item.Comments.trim() !== ""
      )
      .map((item: any) => `${item.TDGPN}: ${item.Comments}`)
      .join("; ");

    return comments;
  };

  const handleUpdatedDataDownload = async (payload: any) => {
    try {
      // Always validate MPF Requested By field if MPF is enabled
      if (mpfEnabled) {
        if (!validateMpfRequestedBy()) {
          // Scroll to top and show error
          window.scrollTo({ top: 0, behavior: "smooth" });
          return; // Stop execution if validation fails
        }
      }

      const inventoryComments = getInventoryComments();
      const response = await DownloadUpdatedData(
        payload,
        mpfEnabled ? 1 : 0,
        mpfRequestedBy,
        inventoryComments
      );

      const disposition = response.headers["content-disposition"];
      const filename =
        getFileNameFromHeader(disposition) || "UpdatedPickList.xlsx";

      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Optional: release memory
      window.URL.revokeObjectURL(url);
    } catch (error) {}
  };

  const handleProductionListSubmit = async () => {
    const filteredData = pickList?.filter((item: any) => item.isGray === true);
    try {
      if (filteredData.length > 0) {
        const payload = {
          excelFixtureDetail: pickListResponse?.excelFixtureDetail || {
            description: "Blank Pick List",
            sopNum: "",
            programName: "",
            fixture: fixtureNumber,
            tempQuantity: 0,
            odd: new Date().toISOString(),
          },
          sheetData: filteredData,
        };
        setProduction(true);
        await handleUpdatedDataDownload(payload);
      }
    } finally {
      setProduction(false);
    }
  };

  const handleSubmit = async () => {
    setInventory(true);

    const filteredData = pickList?.filter(
      (item: any) =>
        item.ActualQtyPicked &&
        item.ActualQtyPicked !== "" &&
        item.ActualQtyPicked !== "0" &&
        item.isGray === false
    );

    const fallbackData = pickList?.filter((item: any) => item.isGray === false);

    try {
      const hasPickedRows = filteredData.length > 0;
      const rowsToDownload = hasPickedRows ? filteredData : fallbackData;

      if (rowsToDownload.length > 0) {
        const payload = {
          excelFixtureDetail: pickListResponse?.excelFixtureDetail || {
            description: "Blank Pick List",
            sopNum: "",
            programName: "",
            fixture: fixtureNumber,
            tempQuantity: 0,
            odd: new Date().toISOString(),
          },
          sheetData: rowsToDownload,
        };

        await handleUpdatedDataDownload(payload);
      }
    } finally {
      setInventory(false);
    }
  };

  useEffect(() => {
    const fetchPickListData = async () => {
      if (!fixtureNumber || !selectedsopId) return;

      // Reset MPF when fetching new data
      setMpfEnabled(false);
      setMpfRequestedBy("");
      setMpfRequestedByError("");

      try {
        if (selectedsopId === "BlankPickList") {
          const response = await getBlankPickListData(fixtureNumber, "om");
          const listData = (response.data.data.listData || []).map(
            (item: any) => ({
              ...item,
              isGrayRow: item.isGray,
            })
          );
          setPickList(listData);
          setPickListResponse(response.data.data);
        }
      } catch (error) {
        // console.error("Error fetching pick list data", error);
        setPickList([]);
        setPickListResponse(null);
      }
    };

    fetchPickListData();
  }, [selectedsopId, fixtureNumber]);

  const getDateStatus = (oddDate: string) => {
    const odd = new Date(oddDate);
    const today = new Date();

    odd.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (odd.getTime() < today.getTime()) return "past";
    if (odd.getTime() === today.getTime()) return "today";
    return "future";
  };

  const formattedPrintedDate = () => {
    const printDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return printDate;
  };
  const formattedRequiredDate = (RequiredDate: Date) => {
    const requiredate = RequiredDate
      ? new Date(RequiredDate)
          .toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "2-digit",
          })
          .replace(/ /g, "-")
      : "";
    return requiredate;
  };

  // Helper function to get default qtyToPick from inventory data
  const getDefaultQtyToPick = (tdgpn: string) => {
    if (!pickListResponse?.inventoryData) return "";

    const inventoryItem = pickListResponse.inventoryData.find(
      (item: any) => item.TDGPN === tdgpn
    );

    if (
      inventoryItem &&
      inventoryItem.allSops &&
      inventoryItem.allSops.length > 0
    ) {
      const sopData = inventoryItem.allSops[0];

      // If MPF is enabled and there are MPF entries, use the last MPF qtyToPick
      if (mpfEnabled) {
        if (sopData.mpf && sopData.mpf.length > 0) {
          // Get the last (most recent) MPF entry
          const lastMpfEntry = sopData.mpf[sopData.mpf.length - 1];
          return "";
        } else {
          return "";
        }
      }

      // Otherwise, use the regular qtyToPick
      return sopData.qtyToPick || "";
    }

    return "";
  };

  // Helper function to get default comments from inventory data
  const getDefaultComments = (tdgpn: string) => {
    if (!pickListResponse?.inventoryData) return "";

    const inventoryItem = pickListResponse.inventoryData.find(
      (item: any) => item.TDGPN === tdgpn
    );

    if (
      inventoryItem &&
      inventoryItem.allSops &&
      inventoryItem.allSops.length > 0
    ) {
      const sopData = inventoryItem.allSops[0];

      // If MPF is enabled and there are MPF entries, use the last MPF comments
      if (mpfEnabled) {
        if (sopData.mpf && sopData.mpf.length > 0) {
          // Get the last (most recent) MPF entry
          const lastMpfEntry = sopData.mpf[sopData.mpf.length - 1];
          return "";
        } else {
          return "";
        }
      }

      // Otherwise, use the regular comments
      return sopData.comments || "";
    }

    return "";
  };

  // Helper function to check if there's any default data in Actual Qty To Be Picked
  const hasDefaultQtyData = () => {
    if (!pickListResponse?.inventoryData) return false;

    return pickListResponse.inventoryData.some((item: any) => {
      if (item.allSops && item.allSops.length > 0) {
        const sopData = item.allSops[0];
        // Check if there's any qtyToPick data (either regular or MPF)
        if (sopData.qtyToPick && sopData.qtyToPick !== "") {
          return true;
        }
        // Check if there are MPF entries with qtyToPick
        if (sopData.mpf && sopData.mpf.length > 0) {
          return sopData.mpf.some(
            (mpfEntry: any) => mpfEntry.qtyToPick && mpfEntry.qtyToPick !== ""
          );
        }
      }
      return false;
    });
  };

  // Function to validate MPF Requested By field
  const validateMpfRequestedBy = () => {
    if (!mpfRequestedBy || mpfRequestedBy.trim() === "") {
      setMpfRequestedByError("MPF Requested By is required");
      return false;
    } else {
      setMpfRequestedByError("");
      return true;
    }
  };

  // Function to reset user-entered data when turning off MPF
  const resetUserEnteredData = () => {
    if (!pickList || !pickListResponse?.inventoryData) return;

    setPickList((prev: any[]) =>
      prev.map((item: any) => {
        if (item.isGrayRow) return item;

        // Reset to default values from inventory data
        const defaultQty = getDefaultQtyToPick(item.TDGPN);
        const defaultComments = getDefaultComments(item.TDGPN);

        return {
          ...item,
          ActualQtyPicked: defaultQty,
          InventoryComments: defaultComments,
        };
      })
    );
  };

  const columns = [
    {
      dataField: "TDGPN",
      text: "TDGPN",
      headerClasses: "tdgpn-column",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "Description",
      text: "Description",
      formatter: (cell: any) => {
        if (!cell) return "";

        // Check if the description starts with "GOES INTO"
        if (cell.startsWith("GOES INTO")) {
          // Split by newline first to get the part before \n
          const partsByNewline = cell.split("\n");
          const beforeNewline = partsByNewline[0]; // Text before \n
          const afterNewline = partsByNewline.slice(1).join("\n"); // Text after \n

          // Split the text before newline into parts
          const parts = beforeNewline.split(" ");

          if (parts.length >= 3) {
            // First part: "GOES"
            // Second part: "INTO"
            // Third part: the word we want to highlight (e.g., "398-300-1324")
            // Rest: remaining text before \n

            const goesInto = parts.slice(0, 2).join(" "); // "GOES INTO"
            const firstWord = parts[2]; // e.g., "398-300-1324"
            const remainingTextBeforeNewline = parts.slice(3).join(" "); // rest of the text before \n

            return (
              <div className="text-base">
                <span className="font-bold text-black">
                  {goesInto} {firstWord}
                </span>
                {remainingTextBeforeNewline && (
                  <span className=""> {remainingTextBeforeNewline}</span>
                )}
                {afterNewline && <span className=""> {afterNewline}</span>}
              </div>
            );
          }
        }

        // If it doesn't start with "GOES INTO", return normal text
        return <div className="text-base ">{cell}</div>;
      },
    },
    {
      dataField: "Vendor",
      text: "Vendor",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "VendorPN",
      text: "VendorPN",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "QuantityPerFixture",
      text: "Quantity Per Fixture",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "UnitOfMeasure",
      text: "Unit of measure",
      formatter: (cell: any, row: any, rowIndex: number) => {
        const normalizeValue = (row.UnitOfMeasure || "").toUpperCase();
        return (
          <div style={{ minWidth: 0, width: "90px", margin: "auto" }}>
            <DropdownList
              options={measureOptions}
              value={normalizeValue}
              onChange={(val: string) => {
                const upperVal = val.toUpperCase();
                setPickList((prev: any[]) =>
                  prev.map((item, i) =>
                    i === rowIndex ? { ...item, UnitOfMeasure: upperVal } : item
                  )
                );
              }}
              className="w-[90px]"
            />
          </div>
        );
      },
    },
    {
      dataField: "TotalQtyNeeded",
      text: "Total Qty Needed",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "ActualQtyPicked",
      text: "Actual Qty To Be Picked",
      headerClasses: "w-[112px]",
      formatter: (cell: any, row: any, index: number) => {
        if (row.isGrayRow) return;
        else {
          // Get default value from inventory data if TDGPN matches
          const defaultValue = getDefaultQtyToPick(row.TDGPN);
          // Use existing value if user has entered something, otherwise use default
          const currentValue =
            row.ActualQtyPicked !== undefined && row.ActualQtyPicked !== ""
              ? row.ActualQtyPicked
              : defaultValue;

          return (
            <div className="flex justify-center w-[100%] mx-auto">
              <FormInput
                type="number"
                inputTable="!w-[100%] "
                value={currentValue}
                onChange={async (e) => {
                  const val = e.target.value;
                  setPickList((prev: any[]) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, ActualQtyPicked: val } : item
                    )
                  );
                }}
                disabled={row.isGrayRow}
                className="w-[100%]"
              />
            </div>
          );
        }
      },
    },
    {
      dataField: "Location",
      text: "Location",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },
    {
      dataField: "LeadHandComments",
      text: "LeadHandComments",
      formatter: (cell: any) => {
        return (
          <div className="text-center  text-base font-semibold">
            {cell || ""}
          </div>
        );
      },
    },

    {
      dataField: "InventoryComments",
      text: "Comments",
      formatter: (cell: any, row: any, index: number) => {
        if (row.isGrayRow) return;
        else {
          // Get default comments from inventory data if TDGPN matches
          const defaultComments = getDefaultComments(row.TDGPN);
          // Use existing value if user has entered something, otherwise use default
          const currentValue =
            row.InventoryComments !== undefined && row.InventoryComments !== ""
              ? row.InventoryComments
              : defaultComments;

          return (
            <div className="flex justify-center w-[100px] mx-auto">
              <FormInput
                type="text"
                inputTable="!w-[100px]"
                value={currentValue}
                onChange={async (e) => {
                  const val = e.target.value;
                  setPickList((prev: any[]) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, InventoryComments: val } : item
                    )
                  );
                }}
                disabled={row.isGrayRow}
                className="w-[100px]"
              />
            </div>
          );
        }
      },
    },
  ];

  return (
    <div>
      <div className="shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] sticky top-0 z-20 bg-white">
        <div className="p-2 text-center">
          {/* <h2 className="text-xl font-bold mb-2">Pick List</h2> */}
          {pickListResponse?.excelFixtureDetail?.description && (
            <div>
              <span className="text-xl text-[#113d5a] font-bold">
                {pickListResponse.excelFixtureDetail.description}
              </span>
            </div>
          )}
          {fixtureNumber && (
            <p className="text-[#1e557a] text-lg font-medium">
              Fixture : {fixtureNumber}
            </p>
          )}
        </div>
      </div>
      {/* <div className="p-4">

                <FormButton
                    btnName={blankLoading ? <BarLoader color="#fff" /> : "Download Blank Pick List"}
                    onClick={() => handleDownloadBlankPickList("blank")}
                    disabled={blankLoading}
                    icon={<FiDownload className='text-xl' strokeWidth={2.5} />}
                    className='bg-[#113d5a] text-white border-none p-3 px-4'
                />

                <div className='flex flex-wrap items-center gap-2.5'>
                    {shouldDisplaySopButtons() && Array.isArray(fixtureData) && fixtureData.map((item: any, index: number) => (
                        <div className='w-42 pt-3' key={index}>
                            <div className='flex flex-col gap-2 border border-gray-300 rounded-md p-4 text-left text-base cursor-pointer hover:bg-gray-100'>
                                <div className='flex items-center gap-1.5 font-bold'>
                                    <div className={`font-bold p-2 rounded-4xl ${getDateStatus(item.ODD) === "past" ? "bg-[#70d189] text-white" : getDateStatus(item.ODD) === "today" ? "bg-[#FEF3C7] text-white" : "bg-[#e6927e] text-white"}`}></div>
                                    SOP: {item.SOPNum}
                                </div>
                                <div className='font-medium'>ODD: {formatDate(item.ODD)}</div>
                                <div className='font-medium'>QTY: {item.Quantity}</div>
                                <button className={`font-bold px-2 py-1.5 rounded-lg outline-none ${getDateStatus(item.ODD) === "past" ? "bg-[#70d189] text-white" : getDateStatus(item.ODD) === "today" ? "bg-[#ebdd92] text-white" : "bg-[#e6927e] text-white"}`} onClick={() => handleItemClick(item.SOPLeadHandEntryId,"item")} disabled={itemLoading}>
                                    {itemLoading ? (
                                        <span className='flex items-center gap-1.5'>
                                            <FiDownload className="text-xl" strokeWidth={2.5} />
                                            <BarLoader color="#fff" height={4} width={80} />
                                        </span>
                                    ) : (
                                        <span className='flex items-center gap-1.5'>
                                            <FiDownload className="text-xl" strokeWidth={2.5} />
                                            Download
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
      <div className="p-5 pb-2">
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full justify-between">
          {/* Left: Dropdown Fieldset */}
          <div className="w-full lg:w-auto lg:min-w-[300px]">
            <fieldset className="w-full pt-3 border border-gray-300 rounded p-4">
              <legend className="text-base font-semibold text-[#113d5a] px-2">
                Select SOPLeadHandEntryId
              </legend>
              <div className="w-full">
                <FormControl fullWidth>
                  <Select
                    value={selectedsopId}
                    onChange={(e) => handleChnage(e.target.value)}
                    displayEmpty
                    className="w-full bg-white"
                    size="small"
                    variant="outlined"
                    open={false}
                    onClick={(e: any) => setAnchorEl(e.currentTarget)}
                  >
                    <MenuItem value={selectedsopId}>
                      {options.find((opt) => opt.value === selectedsopId)
                        ?.label || "Select SOP..."}
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </fieldset>
          </div>

          {/* Center: Manual Pick Form Text */}
          <div className="flex-shrink-0 mr-[177px]">
            <span
              className={`text-lg font-bold transition-all duration-200 ${
                mpfEnabled ? "text-green-600 block" : "text-gray-600 hidden"
              }`}
            >
              Manual Pick Form
            </span>
          </div>

          {/* Right: MPF Toggle Button */}
          <div className="flex items-center gap-2 flex-shrink-0 mr-[30px]">
            <span className="text-[18px] font-semibold text-gray-600">MPF</span>
            <button
              onClick={() => {
                if (hasDefaultQtyData()) {
                  const newMpfEnabled = !mpfEnabled;
                  setMpfEnabled(newMpfEnabled);
                  // If enabling MPF, validate the field
                  if (newMpfEnabled) {
                    setTimeout(() => validateMpfRequestedBy(), 100);
                  } else {
                    setMpfRequestedByError("");
                    // Reset user-entered data when turning off MPF
                    resetUserEnteredData();
                  }
                }
              }}
              disabled={!hasDefaultQtyData()}
              className={`relative inline-flex h-[27px] w-[55px] items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                !hasDefaultQtyData()
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : mpfEnabled
                  ? "bg-green-600 cursor-pointer"
                  : "bg-gray-300 cursor-pointer"
              }`}
              title={
                !hasDefaultQtyData() ? "No default quantity data available" : ""
              }
            >
              <span
                className={`inline-block h-[17px] w-[17px] transform rounded-full bg-white transition-transform duration-200 ${
                  mpfEnabled ? "translate-x-[33px]" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Paper
              sx={{
                p: 2,
                width: { xs: "90vw", sm: "500px", md: "600px" },
                maxWidth: "90vw",
                minWidth: { xs: "280px", sm: "400px" },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {options && options.length > 0 ? (
                  options.map((option: any, idx: number) => (
                    <Box
                      key={option.value ?? idx}
                      onClick={() => {
                        handleChnage(option.value);
                        setAnchorEl(null);
                      }}
                      sx={{
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        cursor: "pointer",
                        backgroundColor:
                          selectedsopId === option.value ? "#e3f2fd" : "white",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      {option.label}
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    No options available
                  </Box>
                )}
              </Box>
            </Paper>
          </Popover>
        </div>
      </div>
      {tblLoading ? (
        <div className="pt-3 text-center text-gray-500 flex items-center justify-center">
          <BeatLoader />
        </div>
      ) : pickList && pickList.length > 0 ? (
        <>
          <div className="p-2">
            <h2 className="flex justify-center text-[#113d5a] font-extrabold text-2xl">
              New Production List
            </h2>
            {selectedsopId && selectedsopId !== "BlankPickList" ? (
              <span className="text-center font-bold text-2xl flex justify-center text-[#1e557a] pb-3 max-md:pb-[30px]">
                SOP : {selectedsopId}
              </span>
            ) : (
              <span className="text-center font-bold text-2xl flex justify-center text-[#1e557a] pb-3 max-md:pb-[30px]">
                {" "}
                {selectedsopId}
              </span>
            )}
            {pickListResponse && selectedsopId !== "BlankPickList" ? (
              <div className="flex gap-2.5 text-[#1e557a] font-medium justify-center text-lg pb-2 max-md:pb-[30px]">
                <table className="table-auto border-collapse border border-black text-sm w-full">
                  <tbody>
                    {/* Row 1 */}
                    <tr className="bg-blue-100 font-bold">
                      <td className="border px-2 py-1">SOP #</td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.sopNum}
                      </td>
                      <td className="border px-2 py-1 text-center" colSpan={3}>
                        PICK LIST #{" "}
                        {pickListResponse.excelFixtureDetail.sopNum || "-"}
                      </td>
                      <td className="border px-2 py-1 relative">
                        {" "}
                        {/* <span
                          className="absolute top-[-24px] left-[10px] max-md:left-[-30px] text-[15px] text-green-600 whitespace-nowrap"
                          style={{ display: mpfEnabled ? "block" : "none" }}
                        >
                          MPF date requested on
                        </span> */}
                        {mpfEnabled ? (
                          <span>MPF DATE REQUESTED ON</span>
                        ) : (
                          <span>PICK LIST PRINTED ON</span>
                        )}{" "}
                        {/* {mpfEnabled ? (
                          <span className="relative ">
                            {" "}
                            <span
                              style={{
                                textDecoration: "line-through",
                                textDecorationColor: "red",
                                color: "inherit",
                              }}
                            >
                              PICK LIST PRINTED ON
                            </span>
                          </span>
                        ) : (
                          <span>PICK LIST PRINTED ON</span>
                        )}{" "} */}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {formattedPrintedDate()}
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        PROJECT
                      </td>
                      <td className="border px-2 py-1 text-center" colSpan={2}>
                        {pickListResponse.excelFixtureDetail.programName}
                      </td>
                      <td className="border px-2 py-1 " colSpan={2}></td>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        PICK LIST LOG NUMBER
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        FIXTURE
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.fixture}
                      </td>
                      {/* Description spans 3 rows and 3 columns */}
                      <td
                        className="border px-2 py-1 align-center "
                        rowSpan={3}
                        colSpan={3}
                      >
                        <span className="flex items-center justify-center">
                          {pickListResponse.excelFixtureDetail.description}
                        </span>
                      </td>

                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        DATE PICKED
                      </td>
                      <td className="border px-2 py-1"></td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        QUANTITY
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.tempQuantity}
                      </td>

                      <td
                        className="border px-2 py-1 font-bold bg-blue-100 relative"
                        rowSpan={2}
                        colSpan={1}
                      >
                        {/* <span
                          className="absolute bottom-[1px] max-md:bottom-[-20px] left-[10px] max-md:left-[-30px] text-[15px] text-green-600 whitespace-nowrap"
                          style={{ display: mpfEnabled ? "block" : "none" }}
                        >
                          MPF requested by
                        </span> */}

                        {mpfEnabled ? (
                          <span>MPF REQUESTED BY</span>
                        ) : (
                          <span>LEAD HAND SIGN OFF</span>
                        )}
                      </td>
                      <td className="border px-2 py-1" rowSpan={2} colSpan={1}>
                        {mpfEnabled && (
                          <div>
                            <input
                              type="text"
                              value={mpfRequestedBy}
                              onChange={(e) => {
                                setMpfRequestedBy(e.target.value);
                                // Clear error when user starts typing
                                if (e.target.value.trim() !== "") {
                                  setMpfRequestedByError("");
                                }
                              }}
                              onBlur={validateMpfRequestedBy}
                              className={`w-full border outline-none rounded px-3 py-1.5 max-w-md text-sm focus:outline-none focus:ring-1 ${
                                mpfRequestedByError
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-[#aaaaaa] focus:ring-blue-500"
                              }`}
                              placeholder="Enter name"
                            />
                            {mpfRequestedByError && (
                              <div className="text-red-500 text-xs mt-1">
                                {mpfRequestedByError}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Row 5 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        REQUIRED ON
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {formattedRequiredDate(
                          pickListResponse.excelFixtureDetail.odd
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex gap-2.5 text-[#1e557a] font-medium justify-center text-lg pb-2 max-md:pb-[30px]">
                <table className="table-auto border-collapse border border-black text-sm w-full">
                  <tbody>
                    {/* Row 1 */}
                    <tr className="bg-blue-100 font-bold">
                      <td className="border px-2 py-1">SOP #</td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.sopNum}
                      </td>
                      <td className="border px-2 py-1 text-center" colSpan={3}>
                        PICK LIST #{" "}
                        {pickListResponse.excelFixtureDetail.sopNum || "-"}
                      </td>
                      <td className="border px-2 py-1 relative">
                        {" "}
                        {/* <span
                          className="absolute top-[-24px] left-[10px] max-md:left-[-30px] text-[15px] text-green-600 whitespace-nowrap"
                          style={{ display: mpfEnabled ? "block" : "none" }}
                        >
                          MPF date requested on
                        </span> */}
                        {mpfEnabled ? (
                          <span>MPF DATE REQUESTED ON</span>
                        ) : (
                          <span>PICK LIST PRINTED ON</span>
                        )}{" "}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {formattedPrintedDate()}
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        PROJECT
                      </td>
                      <td className="border px-2 py-1 text-center" colSpan={2}>
                        {pickListResponse.excelFixtureDetail.programName}
                      </td>
                      <td className="border px-2 py-1 " colSpan={2}></td>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        PICK LIST LOG NUMBER
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        FIXTURE
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.fixture}
                      </td>
                      {/* Description spans 3 rows and 3 columns */}
                      <td
                        className="border px-2 py-1 align-center "
                        rowSpan={3}
                        colSpan={3}
                      >
                        <span className="flex items-center justify-center">
                          {pickListResponse.excelFixtureDetail.description}
                        </span>
                      </td>

                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        DATE PICKED
                      </td>
                      <td className="border px-2 py-1"></td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        QUANTITY
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.tempQuantity}
                      </td>

                      <td
                        className="border px-2 py-1 font-bold bg-blue-100 relative"
                        rowSpan={2}
                        colSpan={1}
                      >
                        {/* <span
                          className="absolute bottom-[1px] max-md:bottom-[-20px] left-[10px] max-md:left-[-30px] text-[15px] text-green-600 whitespace-nowrap"
                          style={{ display: mpfEnabled ? "block" : "none" }}
                        >
                          MPF requested by
                        </span> */}

                        {mpfEnabled ? (
                          <span>MPF REQUESTED BY</span>
                        ) : (
                          <span>LEAD HAND SIGN OFF</span>
                        )}
                        {/* <span className="relative">
                          {" "}
                          LEAD HAND SIGN OFF{" "}
                          <span
                            className="absolute top-[10px] left-0 right-0 h-[1px] bg-[#ff0000]"
                            style={{ display: mpfEnabled ? "block" : "none" }}
                          ></span>
                        </span> */}
                      </td>
                      <td className="border px-2 py-1" rowSpan={2} colSpan={1}>
                        {mpfEnabled && (
                          <div>
                            <input
                              type="text"
                              value={mpfRequestedBy}
                              onChange={(e) => {
                                setMpfRequestedBy(e.target.value);
                                // Clear error when user starts typing
                                if (e.target.value.trim() !== "") {
                                  setMpfRequestedByError("");
                                }
                              }}
                              onBlur={validateMpfRequestedBy}
                              className={`w-full border outline-none rounded px-3 py-1.5 max-w-md text-sm focus:outline-none focus:ring-1 ${
                                mpfRequestedByError
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-[#aaaaaa] focus:ring-blue-500"
                              }`}
                              placeholder="Enter name"
                            />
                            {mpfRequestedByError && (
                              <div className="text-red-500 text-xs mt-1">
                                {mpfRequestedByError}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Row 5 */}
                    <tr>
                      <td className="border px-2 py-1 font-bold bg-blue-100">
                        REQUIRED ON
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {formattedRequiredDate(
                          pickListResponse.excelFixtureDetail.odd
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="picklist_page_table">
              <Table
                columns={columns}
                data={pickList}
                tableHeading="picklist_th"
                rowClassName={(row, i) =>
                  row.isGrayRow ? "!bg-[#e5e5e5]" : ""
                }
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end pb-3.5 gap-3 sm:gap-5 w-full px-[20px]">
            <div className="flex justify-end w-full sm:w-auto">
              <FormButton
                btnName={
                  <span className="flex items-center gap-2">
                    <FiDownload className="text-xl" strokeWidth={2.5} />
                    {loading ? (
                      <BarLoader color="#fff" height={4} width={60} />
                    ) : (
                      "Download full picklist"
                    )}
                  </span>
                }
                onClick={() => {
                  if (selectedsopId === "BlankPickList") {
                    handleDownloadBlankPickList("full");
                  } else {
                    const selectedFixture = fixtureData.find(
                      (item: any) => item.SOPNum === selectedsopId
                    );
                    if (selectedFixture) {
                      handleItemClick(
                        selectedFixture.SOPLeadHandEntryId,
                        "inventory"
                      );
                    }
                  }
                }}
                disabled={loading}
                className="bg-[#113d5a] text-white border-none p-3 px-4 w-full sm:w-auto"
              />
            </div>

            <div className="flex justify-end w-full sm:w-auto">
              <FormButton
                btnName={
                  <span className="flex items-center gap-2">
                    <FiDownload className="text-xl" strokeWidth={2.5} />
                    {inventory ? (
                      <BarLoader color="#fff" height={4} width={60} />
                    ) : (
                      "Inventory pick list download"
                    )}
                  </span>
                }
                onClick={handleSubmit}
                disabled={inventory}
                className="bg-[#113d5a] text-white border-none p-3 px-4 w-full sm:w-auto"
              />
            </div>

            <div className="flex justify-end w-full sm:w-auto">
              <FormButton
                btnName={
                  production ? (
                    <BarLoader color="#fff" height={4} width={60} />
                  ) : (
                    "Production pick list download"
                  )
                }
                onClick={handleProductionListSubmit}
                disabled={production}
                icon={<FiDownload className="text-xl" strokeWidth={2.5} />}
                className="bg-[#113d5a] text-white border-none p-3 px-4 w-full sm:w-auto"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="pt-3 text-center text-gray-500">
          <BeatLoader />
        </div>
      )}
    </div>
  );
};

export default PickList;
