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

      {/* Menu Options */}
      <div className="p-4">
        <div className="flex justify-start">
          <button
            onClick={() => router.push("/inventory-search")}
            className="text-[darkblue] border-b border-[darkblue] font-medium cursor-pointer backdrop-blur-sm bg-transparent shadow-none hover:bg-transparent transition-colors duration-200"
          >
            Inventory Search
          </button>
        </div>
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
