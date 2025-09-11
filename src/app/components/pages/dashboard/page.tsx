"use client";
import React, { useEffect, useState } from "react";
import FormInput from "../../form/forminpt";
import { GetData } from "@/app/services/fetchData";
import BoxContainer from "../../atoms/boxContainer/index";
import FixtureData from "../../atoms/fixture";
import { BeatLoader } from "react-spinners";
import PickList from "../../atoms/picklist";
import { useRouter } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import TokenDebugger from "@/app/components/TokenDebugger";

const DashboardComponent = () => {
  const [data, setData] = useState<any>(null);
  const [sopNumber, setSopNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const FetchData = async (sopNum: string) => {
    if (!sopNum.trim()) {
      setError("Please enter a SOP number");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors

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

  return (
    <div>
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

      {/* Navigation Menu */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <nav className="flex items-center space-x-8">
          <button
            onClick={() => router.push("/inventory-search")}
            className="inline-flex items-center cursor-pointer px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Inventory Search
          </button>
        </nav>
      </div>

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

export default DashboardComponent;
