"use client";
import React from "react";
import LogoutButton from "./LogoutButton";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationLinks = [
    // First Row
    { name: "SOP Search", path: "/" },
    { name: "Inventory Search", path: "/inventory-search" },
    { name: "Admin Search", path: "/admin-search" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-[#39495f] text-white">
      {/* Top Bar with Logo and Icons */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-b-[#ffffff30]">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/images/logo.png" alt="logo" className="w-[70px]" />

          {/* <span className="text-2xl font-normal text-white">TDG</span> */}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <LogoutButton className="cursor-pointer ml-2 px-3 py-1.5 text-sm bg-transparent border border-white/30 rounded hover:bg-white/10 transition-colors">
            Logout
          </LogoutButton>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-6 py-2">
        {/* First Row */}
        <div className="flex flex-wrap items-center gap-6 py-2">
          {navigationLinks.slice(0, 16).map((link, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(link.path)}
              className={`text-sm transition-colors relative cursor-pointer ${
                isActive(link.path)
                  ? "text-[#3498DB] font-medium"
                  : "text-white hover:text-[#3498DB]"
              }`}
            >
              {link.name}
              {/* {link.hasNotification && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )} */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
