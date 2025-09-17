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
import { toastUtils } from "@/app/utils/toastUtils";
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

// Utility function to handle null/undefined values in sheet data
const sanitizeSheetDataItem = (item: any) => {
  return {
    ...item,
    // Numeric fields - set to 0 if null/undefined
    TotalQtyNeeded: item.TotalQtyNeeded ?? 0,
    QuantityPerFixture: item.QuantityPerFixture ?? 0,
    Quantity: item.Quantity ?? 0,
    Size: item.Size ?? 0,
    // String fields - set to empty string if null/undefined
    ActualQtyPicked:
      item.ActualQtyPicked === "" || item.ActualQtyPicked === null
        ? 0
        : item.ActualQtyPicked,
    mpfQty: item.mpfQty === "" || item.mpfQty === null ? 0 : item.mpfQty,
    InventoryComments: item.InventoryComments ?? "",
    TDGPN: item.TDGPN ?? "",
    Description: item.Description ?? "",
    Vendor: item.Vendor ?? "",
    VendorPN: item.VendorPN ?? "",
    UnitOfMeasure: item.UnitOfMeasure ?? "",
    Location: item.Location ?? "",
    LeadHandComments: item.LeadHandComments ?? "",
  };
};

const PickList = () => {
  const searchParams = useSearchParams();
  const [fixtureNumber, setFixtureNumber] = useState<string>("");
  const [fixtureData, setFixtureData] = useState<any>();
  const [pickList, setPickList] = useState<any>();
  const [selectedsopId, setSelectedSopId] = useState<string>("");
  const [pickListResponse, setPickListResponse] = useState<any>(null);
  const [tblLoading, setTblLoading] = useState(false);
  const [inventory, setInventory] = useState(false);
  const [production, setProduction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blankLoading, setblankLoading] = useState(false);
  const [itemLoading, setitemLoading] = useState(false);
  const [fixtureLoading, setFixtureLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [mpfEnabled, setMpfEnabled] = useState(false);
  const [mpfRequestedBy, setMpfRequestedBy] = useState<string>("");
  const [mpfRequestedByError, setMpfRequestedByError] = useState<string>("");
  const [commentOtherStates, setCommentOtherStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [validationErrors, setValidationErrors] = useState<{
    actualQty: boolean;
    mpfQty: boolean;
    comments: boolean;
    mpfRequestedBy: boolean;
    qtyLimit: boolean;
  }>({
    actualQty: false,
    mpfQty: false,
    comments: false,
    mpfRequestedBy: false,
    qtyLimit: false,
  });

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

  // Function to refetch picklist data (reuses handleChnage logic to avoid duplication)
  const refetchPickListData = async () => {
    if (!selectedsopId) return;

    // Reuse the existing handleChnage function to avoid duplicate API calls
    await handleChnage(selectedsopId);
  };

  // Handle Redux download state changes
  useEffect(() => {
    if (success && filename) {
      // Refetch picklist data after successful download
      refetchPickListData();
      dispatch(resetDownloadState());
    }

    if (error) {
      dispatch(resetDownloadState());
    }
  }, [
    success,
    error,
    filename,
    dispatch,
    selectedsopId,
    fixtureNumber,
    fixtureData,
  ]);

  const GetFixtureData = async (fixtureNum: string) => {
    setFixtureLoading(true);
    try {
      const response = await GetFixtureDetails(fixtureNum);
      setFixtureData(response.data.data);
    } catch (err) {
      // console.error("Error fetching fixture details:", err)
      setFixtureData(null);
    } finally {
      setFixtureLoading(false);
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
            mpfQty: item.mpfQty || "", // Initialize MPF quantity
            userModifiedActualQty: false, // Track if user has modified this field
            userModifiedComments: false, // Track if user has modified comments field
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
              mpfQty: item.mpfQty || "", // Initialize MPF quantity
              userModifiedActualQty: false, // Track if user has modified this field
              userModifiedComments: false, // Track if user has modified comments field
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

  const commentOptions = [
    { label: "Good", value: "Good" },
    { label: "Damaged", value: "Damaged" },
    { label: "Missing", value: "Missing" },
    { label: "Other", value: "Other" },
  ];

  function getFileNameFromHeader(disposition: any) {
    if (!disposition) return null;
    const match = disposition.match(/filename="(.+)"/);
    return match ? match[1] : null;
  }

  // Helper function to collect all comments from picklist (including default comments)
  const getInventoryComments = () => {
    if (!pickList || pickList.length === 0) return "";
    console.log("pickList", pickList);

    const comments = pickList
      .filter((item: any) => !item.isGrayRow)
      .map((item: any) => {
        // Get user comments if they exist
        const userComments =
          item.InventoryComments && item.InventoryComments.trim() !== ""
            ? item.InventoryComments
            : "";

        // Get default comments
        const defaultComments: any = getDefaultComments(item.TDGPN);

        // Combine user and default comments
        let combinedComments = "";
        if (userComments) {
          combinedComments = userComments;
        } else {
          combinedComments = defaultComments;
        }

        // Only include if there are any comments
        return combinedComments;
      })
      .filter((comment: string | null) => comment !== null);

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

      const response = await DownloadUpdatedData(
        payload,
        mpfEnabled ? 1 : 0,
        mpfRequestedBy,
        "" // Empty string since comments are now in sheetData
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

      // Turn off MPF after successful download
      setMpfEnabled(false);
      setMpfRequestedBy("");
      setMpfRequestedByError("");

      // Refetch picklist data after successful download
      await refetchPickListData();
    } catch (error) {
      console.error("Error downloading updated data:", error);
    }
  };

  const handleProductionListSubmit = async () => {
    const filteredData = pickList?.filter((item: any) => item.isGray === true);
    try {
      if (filteredData.length > 0) {
        // Filter and process data based on MPF mode
        const processedSheetData = filteredData
          .filter((item: any) => {
            if (mpfEnabled) {
              // When MPF is enabled, include items with MPF quantities
              return (
                item.mpfQty && item.mpfQty.trim() !== "" && item.mpfQty !== "0"
              );
            } else {
              // When MPF is disabled, include items with user-modified ActualQtyPicked
              return (
                item.userModifiedActualQty &&
                item.ActualQtyPicked &&
                item.ActualQtyPicked !== "" &&
                item.ActualQtyPicked !== "0"
              );
            }
          })
          .map((item: any) => {
            // First sanitize null/undefined values
            let processedItem = sanitizeSheetDataItem(item);

            if (mpfEnabled) {
              // In MPF mode, clear ActualQtyPicked and keep MPF quantity
              processedItem.ActualQtyPicked = "";
              processedItem.mpfQty = item.mpfQty || "";
            } else {
              // In normal mode, keep user's ActualQtyPicked value
              processedItem.ActualQtyPicked = item.ActualQtyPicked || "";
            }

            // Get user comments if they exist
            const userComments =
              item.InventoryComments && item.InventoryComments.trim() !== ""
                ? item.InventoryComments
                : "";

            // Get default comments
            const defaultComments = getDefaultComments(item.TDGPN);

            // Combine user and default comments
            let combinedComments = "";
            if (userComments) {
              combinedComments = userComments;
            } else {
              combinedComments = defaultComments || "";
            }

            // Add the combined comments to the item
            processedItem.InventoryComments = combinedComments;

            return processedItem;
          });

        const payload = {
          excelFixtureDetail: {
            description:
              pickListResponse?.excelFixtureDetail?.description ||
              "Blank Pick List",
            sopNum: pickListResponse?.excelFixtureDetail?.sopNum || "",
            programName:
              pickListResponse?.excelFixtureDetail?.programName || "",
            fixture: fixtureNumber || "",
            tempQuantity:
              pickListResponse?.excelFixtureDetail?.tempQuantity ?? 0,
            odd:
              pickListResponse?.excelFixtureDetail?.odd ||
              new Date().toISOString(),
          },
          sheetData: processedSheetData,
        };
        setProduction(true);
        await handleUpdatedDataDownload(payload);
      }
    } finally {
      setProduction(false);
    }
  };

  // Validation function for inventory pick list download
  const validateInventoryPickList = () => {
    // Reset validation errors
    setValidationErrors({
      actualQty: false,
      mpfQty: false,
      comments: false,
      mpfRequestedBy: false,
      qtyLimit: false,
    });

    if (!pickList || pickList.length === 0) {
      toastUtils.error("No pick list data available");
      return false;
    }

    const nonGrayRows = pickList.filter((item: any) => !item.isGrayRow);

    // Check if there are any rows with ActualQtyPicked (including default data)
    const hasPickedRows = nonGrayRows.some((item: any) => {
      // Check if user has modified quantities or if there's default data
      const hasUserQty =
        item.userModifiedActualQty &&
        item.ActualQtyPicked &&
        item.ActualQtyPicked !== "" &&
        item.ActualQtyPicked !== "0";
      const hasDefaultQty =
        !item.userModifiedActualQty &&
        getDefaultQtyToPick(item.TDGPN) &&
        getDefaultQtyToPick(item.TDGPN) !== "" &&
        getDefaultQtyToPick(item.TDGPN) !== "0";
      return hasUserQty || hasDefaultQty;
    });

    if (!hasPickedRows) {
      setValidationErrors((prev) => ({ ...prev, actualQty: true }));
      toastUtils.error(
        "Please enter quantities in 'Actual Qty To Be Picked' field"
      );
      return false;
    }

    // Check if Actual Qty To Be Picked is greater than Total Qty Needed
    const invalidQtyRows = nonGrayRows.filter((item: any) => {
      const actualQty = item.userModifiedActualQty
        ? parseFloat(item.ActualQtyPicked) || 0
        : parseFloat(getDefaultQtyToPick(item.TDGPN)) || 0;
      const totalQty = parseFloat(item.TotalQtyNeeded) || 0;

      return actualQty > totalQty && actualQty > 0;
    });

    if (invalidQtyRows.length > 0) {
      setValidationErrors((prev) => ({ ...prev, actualQty: true }));
      toastUtils.error(
        "Actual Qty To Be Picked cannot be greater than Total Qty Needed"
      );
      return false;
    }

    // Check if user entered quantity is less than or equal to the default/previous value
    const invalidLimitRows = nonGrayRows.filter((item: any) => {
      if (!item.userModifiedActualQty) return false; // Only check user-modified items

      const userQty = parseFloat(item.ActualQtyPicked) || 0;
      const defaultQty = parseFloat(getDefaultQtyToPick(item.TDGPN)) || 0;

      return userQty <= defaultQty && defaultQty > 0;
    });

    if (invalidLimitRows.length > 0) {
      setValidationErrors((prev) => ({ ...prev, qtyLimit: true }));
      toastUtils.error(
        "You must enter a quantity greater than the default value. Please check the highlighted fields."
      );
      return false;
    }

    // Get rows that have quantities (including default data)
    const rowsWithQty = nonGrayRows.filter((item: any) => {
      const hasUserQty =
        item.userModifiedActualQty &&
        item.ActualQtyPicked &&
        item.ActualQtyPicked !== "" &&
        item.ActualQtyPicked !== "0";
      const hasDefaultQty =
        !item.userModifiedActualQty &&
        getDefaultQtyToPick(item.TDGPN) &&
        getDefaultQtyToPick(item.TDGPN) !== "" &&
        getDefaultQtyToPick(item.TDGPN) !== "0";
      return hasUserQty || hasDefaultQty;
    });

    if (mpfEnabled) {
      // Check if MPF Requested By field is filled
      if (!mpfRequestedBy || mpfRequestedBy.trim() === "") {
        setValidationErrors((prev) => ({ ...prev, mpfRequestedBy: true }));
        toastUtils.error("MPF Requested By is required when MPF is enabled");
        return false;
      }

      // When MPF is enabled, check comments only for items with MPF quantities
      const rowsWithMpfQty = nonGrayRows.filter(
        (item: any) => item.mpfQty && item.mpfQty.trim() !== ""
      );

      // Check if there are any MPF quantities at all
      if (rowsWithMpfQty.length === 0) {
        setValidationErrors((prev) => ({ ...prev, mpfQty: true }));
        toastUtils.error(
          "Please enter at least one MPF quantity when MPF is enabled"
        );
        return false;
      }

      // Check if all rows with MPF quantities have comments
      const rowsMissingComments = rowsWithMpfQty.filter((item: any) => {
        const hasUserComments =
          item.userModifiedComments &&
          item.InventoryComments &&
          item.InventoryComments.trim() !== "";
        const hasDefaultComments =
          !item.userModifiedComments &&
          getDefaultComments(item.TDGPN) &&
          getDefaultComments(item.TDGPN).trim() !== "";
        return !hasUserComments && !hasDefaultComments;
      });

      // Validation: All items with MPF quantities must have comments
      if (rowsMissingComments.length > 0) {
        setValidationErrors((prev) => ({ ...prev, comments: true }));
        toastUtils.error(
          "Comments are required for all items with MPF quantities"
        );
        return false;
      }
    } else {
      // When MPF is disabled, no comment validation is required
      // Comments are only required when MPF is enabled
    }

    return true;
  };

  // Functions to clear validation errors when user interacts with fields
  const clearActualQtyError = () => {
    setValidationErrors((prev) => ({ ...prev, actualQty: false }));
  };

  const clearMpfQtyError = () => {
    setValidationErrors((prev) => ({ ...prev, mpfQty: false }));
  };

  const clearCommentsError = () => {
    setValidationErrors((prev) => ({ ...prev, comments: false }));
  };

  const clearMpfRequestedByError = () => {
    setValidationErrors((prev) => ({ ...prev, mpfRequestedBy: false }));
  };

  const clearQtyLimitError = () => {
    setValidationErrors((prev) => ({ ...prev, qtyLimit: false }));
  };

  const handleSubmit = async () => {
    // Validate before proceeding
    if (!validateInventoryPickList()) {
      return;
    }

    setInventory(true);

    let filteredData;
    let fallbackData;

    if (mpfEnabled) {
      // When MPF is enabled, filter based on MPF quantities
      filteredData = pickList?.filter(
        (item: any) =>
          item.mpfQty &&
          item.mpfQty !== "" &&
          item.mpfQty !== "0" &&
          item.isGray === false
      );
      fallbackData = pickList?.filter((item: any) => item.isGray === false);
    } else {
      // When MPF is disabled, filter based on ActualQtyPicked (including default values)
      filteredData = pickList?.filter((item: any) => {
        if (item.isGray === true) return false;

        // Check if user has entered a quantity
        const hasUserQty =
          item.ActualQtyPicked &&
          item.ActualQtyPicked !== "" &&
          item.ActualQtyPicked !== "0";

        // Check if there's a default quantity
        const defaultQty = getDefaultQtyToPick(item.TDGPN);
        const hasDefaultQty =
          defaultQty && defaultQty !== "" && defaultQty !== "0";

        // Include if either user quantity or default quantity exists
        return hasUserQty || hasDefaultQty;
      });
      fallbackData = pickList?.filter((item: any) => item.isGray === false);
    }

    try {
      const hasPickedRows = filteredData.length > 0;
      const rowsToDownload = hasPickedRows ? filteredData : fallbackData;

      if (rowsToDownload.length > 0) {
        // Filter and process data based on MPF mode
        const processedSheetData = rowsToDownload
          .filter((item: any) => {
            if (mpfEnabled) {
              // When MPF is enabled, include items with MPF quantities
              return (
                item.mpfQty && item.mpfQty.trim() !== "" && item.mpfQty !== "0"
              );
            } else {
              // When MPF is disabled, include items with user-modified ActualQtyPicked
              return (
                item.userModifiedActualQty &&
                item.ActualQtyPicked &&
                item.ActualQtyPicked !== "" &&
                item.ActualQtyPicked !== "0"
              );
            }
          })
          .map((item: any) => {
            // First sanitize null/undefined values
            let processedItem = sanitizeSheetDataItem(item);

            if (mpfEnabled) {
              // In MPF mode, clear ActualQtyPicked and keep MPF quantity
              processedItem.ActualQtyPicked = "";
              processedItem.mpfQty = item.mpfQty || "";
            } else {
              // In normal mode, keep user's ActualQtyPicked value
              processedItem.ActualQtyPicked = item.ActualQtyPicked || "";
            }

            // Get user comments if they exist
            const userComments =
              item.InventoryComments && item.InventoryComments.trim() !== ""
                ? item.InventoryComments
                : "";

            // Get default comments
            const defaultComments = getDefaultComments(item.TDGPN);

            // Combine user and default comments
            let combinedComments = "";
            if (userComments) {
              combinedComments = userComments;
            } else {
              combinedComments = defaultComments || "";
            }

            // Add the combined comments to the item
            processedItem.InventoryComments = combinedComments;

            return processedItem;
          });

        const payload = {
          excelFixtureDetail: {
            description:
              pickListResponse?.excelFixtureDetail?.description ||
              "Blank Pick List",
            sopNum: pickListResponse?.excelFixtureDetail?.sopNum || "",
            programName:
              pickListResponse?.excelFixtureDetail?.programName || "",
            fixture: fixtureNumber || "",
            tempQuantity:
              pickListResponse?.excelFixtureDetail?.tempQuantity ?? 0,
            odd:
              pickListResponse?.excelFixtureDetail?.odd ||
              new Date().toISOString(),
          },
          sheetData: processedSheetData,
        };

        await handleUpdatedDataDownload(payload);
      }
    } finally {
      setInventory(false);
    }
  };

  useEffect(() => {
    // Only handle initial data fetch when fixtureNumber changes
    // SOP changes are handled by handleChnage function
    if (!fixtureNumber) return;

    // Reset states when fixture changes
    setMpfEnabled(false);
    setMpfRequestedBy("");
    setMpfRequestedByError("");
    setPickList([]);
    setPickListResponse(null);
  }, [fixtureNumber]);

  // Handle initial data fetch when fixtureNumber changes (only for initial load)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!fixtureNumber || !fixtureData || fixtureData.length === 0) return;

      // Only fetch initial data if no picklist data exists yet (initial load)
      if (pickList && pickList.length > 0) return;

      setTblLoading(true);

      try {
        // Set default to BlankPickList on initial load and fetch data
        setSelectedSopId("BlankPickList");
        const response = await getBlankPickListData(fixtureNumber, "om");
        const listData = (response.data.data.listData || []).map(
          (item: any) => ({
            ...item,
            isGrayRow: item.isGray,
            mpfQty: item.mpfQty || "",
            userModifiedActualQty: false,
            userModifiedComments: false,
          })
        );
        setPickList(listData);
        setPickListResponse(response.data.data);
      } catch (error) {
        setPickList([]);
        setPickListResponse(null);
      } finally {
        setTblLoading(false);
      }
    };

    fetchInitialData();
  }, [fixtureNumber, fixtureData]); // Removed selectedsopId from dependencies

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
      // Always use the regular qtyToPick
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
        // Check if there's any qtyToPick data
        if (sopData.qtyToPick && sopData.qtyToPick !== "") {
          return true;
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

    // Clear comment other states to prevent focus issues
    setCommentOtherStates({});

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
          mpfQty: "", // Reset MPF quantity when turning off MPF
          userModifiedActualQty: false, // Reset user modification flag
          userModifiedComments: false, // Reset user modification flag for comments
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
          // Use user's value if they have modified the field, otherwise use default
          const currentValue = row.userModifiedActualQty
            ? row.ActualQtyPicked || ""
            : defaultValue;

          // Check if this row has invalid quantity (Actual Qty > Total Qty)
          const actualQty = parseFloat(currentValue) || 0;
          const totalQty = parseFloat(row.TotalQtyNeeded) || 0;
          const hasInvalidQty = actualQty > totalQty && actualQty > 0;

          // Check if this row has quantity limit error (user qty <= default qty)
          const defaultQty = parseFloat(getDefaultQtyToPick(row.TDGPN)) || 0;
          const hasQtyLimitError =
            row.userModifiedActualQty &&
            actualQty <= defaultQty &&
            defaultQty > 0;

          const shouldShowRedBorder =
            (validationErrors.actualQty && hasInvalidQty) ||
            (validationErrors.qtyLimit && hasQtyLimitError);

          // When MPF is enabled, show only the number (not input field)
          if (mpfEnabled) {
            return (
              <div className="flex justify-center w-[100%] mx-auto">
                <div
                  className={`text-center text-base font-semibold w-[100%] py-2 ${""}`}
                >
                  {currentValue || ""}
                </div>
              </div>
            );
          }

          return (
            <div className="flex justify-center w-[100%] mx-auto">
              <FormInput
                type="number"
                inputTable="!w-[100%] "
                value={currentValue}
                onChange={async (e) => {
                  const val = e.target.value;
                  clearActualQtyError(); // Clear validation error when user types
                  clearQtyLimitError(); // Clear quantity limit error when user types
                  setPickList((prev: any[]) =>
                    prev.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            ActualQtyPicked: val,
                            userModifiedActualQty: true, // Mark as user modified
                          }
                        : item
                    )
                  );
                }}
                disabled={row.isGrayRow}
                className={`w-[100%] `}
                inputClass={`${
                  shouldShowRedBorder
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
            </div>
          );
        }
      },
    },
    // MPF column - only show when MPF is enabled
    ...(mpfEnabled
      ? [
          {
            dataField: "mpfQty",
            text: "MPF",
            headerClasses: "w-[112px]",
            formatter: (cell: any, row: any, index: number) => {
              if (row.isGrayRow) return;
              else {
                return (
                  <div className="flex justify-center w-[100%] mx-auto">
                    <FormInput
                      type="number"
                      inputTable="!w-[100%] "
                      value={row.mpfQty || ""}
                      onChange={async (e) => {
                        const val = e.target.value;
                        clearMpfQtyError(); // Clear validation error when user types
                        setPickList((prev: any[]) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, mpfQty: val } : item
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
        ]
      : []),
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

    // Comments column - only show when MPF is enabled
    ...(mpfEnabled
      ? [
          {
            dataField: "InventoryComments",
            text: "Comments",
            classNames: "w-[200px]",
            formatter: (cell: any, row: any, index: number) => {
              if (row.isGrayRow) return;
              else {
                // Get default comments from inventory data if TDGPN matches
                const defaultComments = getDefaultComments(row.TDGPN);
                console.log("defaultComments", defaultComments);
                // Use user's value if they have modified the field, otherwise use default
                const currentValue = row.userModifiedComments
                  ? row.InventoryComments || ""
                  : defaultComments;

                // Check if current value is a predefined option
                const isPredefinedOption = commentOptions.some(
                  (opt) => opt.value === currentValue
                );
                const isOtherMode =
                  commentOtherStates[index] ||
                  currentValue === "Other" ||
                  (!isPredefinedOption && currentValue !== "");
                const showTextInput = isOtherMode;

                // Determine what to show in dropdown
                const dropdownValue = isPredefinedOption
                  ? currentValue
                  : isOtherMode
                  ? "Other"
                  : "";

                // Check if this specific row should show red border
                // Only show red border if this row has quantity data but is missing comments
                let hasQuantity = false;

                if (mpfEnabled) {
                  // When MPF is enabled, check for MPF quantities
                  hasQuantity = row.mpfQty && row.mpfQty.trim() !== "";
                } else {
                  // When MPF is disabled, check for Actual Qty To Be Picked
                  const hasUserQty =
                    row.userModifiedActualQty &&
                    row.ActualQtyPicked &&
                    row.ActualQtyPicked !== "" &&
                    row.ActualQtyPicked !== "0";
                  const hasDefaultQty =
                    !row.userModifiedActualQty &&
                    getDefaultQtyToPick(row.TDGPN) &&
                    getDefaultQtyToPick(row.TDGPN) !== "" &&
                    getDefaultQtyToPick(row.TDGPN) !== "0";
                  hasQuantity = hasUserQty || hasDefaultQty;
                }

                const hasUserComments =
                  row.userModifiedComments &&
                  row.InventoryComments &&
                  row.InventoryComments.trim() !== "";
                const hasDefaultComments =
                  !row.userModifiedComments &&
                  getDefaultComments(row.TDGPN) &&
                  getDefaultComments(row.TDGPN).trim() !== "";
                const hasComments = hasUserComments || hasDefaultComments;

                // Show red border only if MPF is enabled, this row has MPF quantity but no comments
                const shouldShowRedBorder =
                  mpfEnabled &&
                  validationErrors.comments &&
                  hasQuantity &&
                  !hasComments;

                return (
                  <div className="flex justify-center w-[200px] mx-auto">
                    <div className="relative w-full">
                      <select
                        value={dropdownValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          clearCommentsError(); // Clear validation error when user selects
                          if (val === "Other") {
                            // When "Other" is selected, set to "Other" to show text input
                            setCommentOtherStates((prev) => ({
                              ...prev,
                              [index]: true,
                            }));
                            setPickList((prev: any[]) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      InventoryComments: "Other",
                                      userModifiedComments: true,
                                    }
                                  : item
                              )
                            );
                          } else if (val === "") {
                            // Clear the field
                            setCommentOtherStates((prev) => ({
                              ...prev,
                              [index]: false,
                            }));
                            setPickList((prev: any[]) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      InventoryComments: "",
                                      userModifiedComments: true,
                                    }
                                  : item
                              )
                            );
                          } else {
                            // Predefined option selected
                            setCommentOtherStates((prev) => ({
                              ...prev,
                              [index]: false,
                            }));
                            setPickList((prev: any[]) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      InventoryComments: val,
                                      userModifiedComments: true,
                                    }
                                  : item
                              )
                            );
                          }
                        }}
                        disabled={row.isGrayRow}
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                          shouldShowRedBorder
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        style={{ minHeight: "32px" }}
                      >
                        <option value="">Select comment...</option>
                        {commentOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Text input for custom comments */}
                      {showTextInput && (
                        <input
                          type="text"
                          value={currentValue === "Other" ? "" : currentValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            clearCommentsError(); // Clear validation error when user types
                            setPickList((prev: any[]) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      InventoryComments: val,
                                      userModifiedComments: true,
                                    }
                                  : item
                              )
                            );
                          }}
                          onKeyDown={(e) => {
                            // Allow backspace, delete, arrow keys, etc.
                            if (
                              e.key === "Backspace" ||
                              e.key === "Delete" ||
                              e.key === "ArrowLeft" ||
                              e.key === "ArrowRight"
                            ) {
                              return;
                            }
                          }}
                          disabled={row.isGrayRow}
                          className={`w-full px-2 py-1 text-sm border rounded mt-1 focus:outline-none focus:ring-1 ${
                            shouldShowRedBorder
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          placeholder="Enter custom comment..."
                        />
                      )}
                    </div>
                  </div>
                );
              }
            },
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] sticky top-0 z-20 bg-white">
        <div className="p-2 text-center">
          {/* <h2 className="text-xl font-bold mb-2">Pick List</h2> */}
          {mpfEnabled ? (
            mpfEnabled ? (
              <div className="text-xl text-green-800 font-bold">
                Manual Pick Form
              </div>
            ) : (
              ""
            )
          ) : (
            pickListResponse?.excelFixtureDetail?.description && (
              <div>
                <span className="text-xl text-[#113d5a] font-bold">
                  {pickListResponse.excelFixtureDetail.description}
                </span>
              </div>
            )
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
              <legend
                className={`text-base font-semibold px-2 ${
                  mpfEnabled ? "text-green-800" : "text-[#113d5a]"
                }`}
              >
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
            <h2
              className={`flex justify-center font-extrabold text-2xl ${
                mpfEnabled ? "text-green-800" : "text-[#113d5a]"
              }`}
            >
              New Production List
            </h2>
            {selectedsopId && selectedsopId !== "BlankPickList" ? (
              <span
                className={`text-center font-bold text-2xl flex justify-center pb-3 max-md:pb-[30px] ${
                  mpfEnabled ? "text-green-800" : "text-[#1e557a]"
                }`}
              >
                SOP : {selectedsopId}
              </span>
            ) : (
              <span className="text-center font-bold text-2xl flex justify-center text-[#1e557a] pb-3 max-md:pb-[30px]">
                {" "}
                {selectedsopId}
              </span>
            )}
            {pickListResponse && selectedsopId !== "BlankPickList" ? (
              <div
                className={`flex gap-2.5  font-medium justify-center text-lg pb-2 max-md:pb-[30px] ${
                  mpfEnabled ? "text-green-800" : "text-[#1e557a]"
                }`}
              >
                <table className="table-auto border-collapse border border-black text-sm w-full">
                  <tbody>
                    {/* Row 1 */}
                    <tr
                      className={`font-bold ${
                        mpfEnabled ? "bg-green-50" : "bg-blue-100"
                      }`}
                    >
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
                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
                        PROJECT
                      </td>
                      <td className="border px-2 py-1 text-center" colSpan={2}>
                        {pickListResponse.excelFixtureDetail.programName}
                      </td>
                      <td className="border px-2 py-1 " colSpan={2}></td>
                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
                        PICK LIST LOG NUMBER
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr>
                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
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

                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
                        DATE PICKED
                      </td>
                      <td className="border px-2 py-1"></td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
                        QUANTITY
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {pickListResponse.excelFixtureDetail.tempQuantity}
                      </td>

                      <td
                        className={`border px-2 py-1 font-bold relative ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
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
                                  clearMpfRequestedByError();
                                }
                              }}
                              onBlur={validateMpfRequestedBy}
                              className={`w-full border outline-none rounded px-3 py-1.5 max-w-md text-sm focus:outline-none focus:ring-1 ${
                                mpfRequestedByError ||
                                validationErrors.mpfRequestedBy
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
                      <td
                        className={`border px-2 py-1 font-bold ${
                          mpfEnabled ? "bg-green-50" : "bg-blue-100"
                        }`}
                      >
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
                                  clearMpfRequestedByError();
                                }
                              }}
                              onBlur={validateMpfRequestedBy}
                              className={`w-full border outline-none rounded px-3 py-1.5 max-w-md text-sm focus:outline-none focus:ring-1 ${
                                mpfRequestedByError ||
                                validationErrors.mpfRequestedBy
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
                tableHeading={`picklist_th ${mpfEnabled ? "mpf_enabled" : ""}`}
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
                className={`border-none p-3 px-4 w-full sm:w-auto ${
                  mpfEnabled
                    ? "bg-[#b7e5b3] text-green-800"
                    : "bg-[#113d5a] text-white"
                }`}
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
                className={`border-none p-3 px-4 w-full sm:w-auto ${
                  mpfEnabled
                    ? "bg-[#b7e5b3] text-green-800"
                    : "bg-[#113d5a] text-white"
                }`}
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
                className={`border-none p-3 px-4 w-full sm:w-auto ${
                  mpfEnabled
                    ? "bg-[#b7e5b3] text-green-800"
                    : "bg-[#113d5a] text-white"
                }`}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="pt-3 text-center text-gray-500">
          {fixtureLoading ? (
            <div className="flex items-center justify-center">
              <BeatLoader />
              {/* <span className="ml-2">Loading fixture details...</span> */}
            </div>
          ) : !fixtureNumber ? (
            "Please select a fixture number"
          ) : !selectedsopId ? (
            "Please select a SOP"
          ) : (
            "NO DATA FOUND"
          )}
        </div>
      )}
    </div>
  );
};

export default PickList;
