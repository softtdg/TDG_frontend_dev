"use client";
import React, { useEffect, useState } from "react";
import FormInput from "../components/form/forminpt";
import { GetData } from "@/app/services/fetchData";
import BoxContainer from "../components/atoms/boxContainer/index";
import FixtureData from "../components/atoms/fixture";
import { BeatLoader } from "react-spinners";
import PickList from "../components/atoms/picklist";
import { useRouter, useSearchParams } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import TokenDebugger from "@/app/components/TokenDebugger";

const SopSearchPage = () => {
  const [data, setData] = useState<any>(null);
  const [sopNumber, setSopNumber] = useState<string>("");
  const [originalSearchTerm, setOriginalSearchTerm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isUrlSearch, setIsUrlSearch] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const FetchData = async (sopNum: string, isFromUrl: boolean = false) => {
    if (!sopNum.trim()) {
      setError("Please enter a SOP number");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors

    // Update URL with search parameter
    const url = new URL(window.location.href);
    url.searchParams.set("sopNumber", sopNum);
    router.replace(url.pathname + url.search, { scroll: false });

    // Set original search term for display
    setOriginalSearchTerm(sopNum);

    try {
      const response = await GetData(sopNum);
      if (response.data && response.data.data) {
        setData(response.data.data);
        setError("");
      } else {
        setError("SOP not found.");
        setData(response.data);
      }
    } catch (error: any) {
      //   console.error("SOP Search Error:", error);

      // Set error message from API response or fallback
      const errorMessage =
        error?.response?.data?.message ||
        "Error searching for SOP. Please try again.";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false); // stop loader
    }
  };

  const handleSopNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSopNumber(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      FetchData(sopNumber);
    }
  };

  // Handle URL query parameters on component mount
  useEffect(() => {
    const sopNumberFromUrl = searchParams.get("sopNumber");
    if (sopNumberFromUrl) {
      setSopNumber(sopNumberFromUrl);
      setOriginalSearchTerm(sopNumberFromUrl);
      setIsUrlSearch(true);
      FetchData(sopNumberFromUrl, true);
    }
  }, [searchParams]);

  return (
    <div>
      {/* Search Form - Hide when search is performed via URL */}
      {true && (
        <div className="p-2 pt-5.5 flex justify-center items-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
            <div className="w-full">
              <FormInput
                type="text"
                label="SOP Number"
                labelCls="pr-0 sm:pr-5"
                value={sopNumber}
                onChange={handleSopNumberChange}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Show search info when data is loaded from URL */}
      {isUrlSearch && data && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg gap-2 sm:gap-0">
          <div className="flex-1 w-full sm:w-auto">
            {/* <FormInput
              type="text"
              label="New SOP Search"
              labelCls="pr-0 sm:pr-5"
              value={sopNumber}
              onChange={handleSopNumberChange}
              onKeyDown={handleKeyDown}
              className="w-full"
            /> */}
          </div>
          <div className="flex-1 w-full sm:w-auto text-center mb-2 sm:mb-0">
            <span className="text-base sm:text-lg font-semibold text-gray-800">
              SOP: {originalSearchTerm}
            </span>
          </div>
          <div className="flex-1 w-full sm:w-auto text-right">
            {/* <span className="text-base sm:text-lg font-semibold text-gray-800 border border-gray-200 rounded-md p-2 bg-[#ffff]">
              Status: {data?.status || "Active"}
            </span> */}
          </div>
        </div>
      )}

      {/* Token Debugger - Remove this in production */}
      {/* <div className="p-4">
        <TokenDebugger />
      </div> */}
      <div className="">
        {error && (
          <div className="pt-5 flex justify-center">
            <span className="text-[oklch(0.47_0.21_28.73)] border border-[oklch(0.47_0.21_28.73)] rounded-md p-2 bg-[oklch(0.97_0.02_17.46)]">
              {error}
            </span>
          </div>
        )}
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center pt-10">
            <BeatLoader />
          </div>
        ) : data && data.length !== 0 ? (
          <>
            <div className="pt-10 max-sm:px-[10px]">
              <BoxContainer data={data} />
            </div>
            <div>
              <FixtureData
                data={data?.fixtures || []}
                data2={data?.leadHandEntry || []}
                FinalDeliveryDate={data?.FinalDeliveryDate}
                // productionDateOut={data?.productionEntry?.[0]?.ProductionDateOut}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SopSearchPage;
