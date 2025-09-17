"use client";
import FormButton from "@/app/components/form/formbutton";
import FormInput from "@/app/components/form/forminpt";
import { LoginDeatils } from "@/app/services/fetchData";
import { setAuthData, clearAllAuthData } from "@/app/utils/cookieUtils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    UserName: "",
    Password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    // Validate form data
    if (!loginData.UserName.trim() || !loginData.Password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await LoginDeatils(loginData);

      const status = response?.data?.status;
      const token = response?.data?.data?.token;
      const userData = response?.data?.data;

      if (status === "SUCCESS" && token) {
        // Store authentication data in cookies
        setAuthData(token, userData);

        // Clear form data
        setLoginData({ UserName: "", Password: "" });

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("authStateChange"));

        // Show success toast
        toast.success("Login successful! Redirecting...", { id: loadingToast });

        // Redirect to SOP search page
        setTimeout(() => {
          router.push("/sop-search");
        }, 1000);
      } else {
        toast.error(
          "Invalid credentials. Please check your username and password.",
          { id: loadingToast }
        );
      }
    } catch (err: any) {
      //   console.error("Login Error", err?.response?.data?.message);

      // Handle different types of errors
      toast.error(err?.response?.data?.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 border-b border-b-[#dee2e6]">
        <span className="text-4xl font-bold">TDG</span>
      </div>
      <div className="flex justify-center align-middle p-6">
        <div className="border border-[#ddd] w-fit rounded-xl">
          <div className="flex justify-center align-middle p-3.5">
            <div>
              <h1 className="font-bold text-3xl flex justify-center p-3.5">
                Login
              </h1>
              <div className="p-2.5">
                <FormInput
                  type="text"
                  placeholder="Username"
                  labelCls="pr-5"
                  label="UserName"
                  name="UserName"
                  value={loginData.UserName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="p-2.5">
                <FormInput
                  type="password"
                  placeholder="Password"
                  labelCls="pr-6.5"
                  label="Password"
                  name="Password"
                  value={loginData.Password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center p-2">
            <FormButton
              btnName={isLoading ? "Logging in..." : "Submit"}
              onClick={handleSubmit}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
