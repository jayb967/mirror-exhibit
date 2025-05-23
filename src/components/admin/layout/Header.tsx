"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";

import NotificationCenter from "../../NotificationCenter";

// prop type
interface HeaderProps {
  setSideMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSideMenu }: HeaderProps) => {
  const [searchOverlay, setSearchOverlay] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // handle logout
  const handleLogOut = () => {
    // Will be implemented with Supabase auth
    router.push(`/admin/login`);
  };

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!pRef?.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pRef]);

  const handleProfileOpen = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <header className="tw-py-5 tw-px-8 tw-h-[78px] tw-flex tw-items-center tw-justify-between tw-bg-white tw-shadow-sm">
      <div className="tw-flex tw-items-center tw-space-x-8">
        <div className="md:tw-hidden">
          <button
            onClick={() => setSideMenu(true)}
            className="tw-w-10 tw-h-10 tw-leading-10 tw-text-center tw-text-black tw-border tw-border-gray-200 hover:tw-bg-[#A6A182] hover:tw-text-white hover:tw-border-[#A6A182]"
          >
            ☰
          </button>
        </div>
        <div className="tw-hidden md:tw-block">
          <form action="">
            <div className="tw-h-[46px] tw-flex tw-items-center tw-relative">
              <input
                type="text"
                className="tw-w-[300px] tw-h-full tw-border tw-border-gray-200 tw-pr-12 tw-pl-5 tw-bg-stone-50 focus:tw-outline-0"
                placeholder="Search for..."
              />
              <button className="tw-absolute tw-right-4 tw-border-0 tw-bg-transparent">
                🔍
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="tw-flex tw-items-center tw-space-x-4">
        <div className="md:tw-hidden">
          <button
            onClick={() => setSearchOverlay(true)}
            className="tw-w-10 tw-h-10 tw-leading-10 tw-text-center tw-rounded-md tw-text-gray tw-border tw-border-gray hover:tw-bg-themeLight hover:tw-text-theme hover:tw-border-themeLight"
          >
            🔍
          </button>
        </div>

        {/* Notifications */}
        <NotificationCenter className="tw-relative" />

        {/* Profile dropdown */}
        <div className="tw-relative" ref={pRef}>
          <button
            onClick={handleProfileOpen}
            className="tw-h-[44px] tw-flex tw-items-center tw-space-x-2 tw-px-2 tw-text-gray-700 hover:tw-bg-gray-100"
          >
            <div className="tw-w-[30px] tw-h-[30px] tw-bg-black tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-sm tw-text-white">👤</span>
            </div>
            <div className="tw-leading-tight tw-text-left">
              <p className="tw-text-sm tw-mb-0">Admin</p>
              <p className="tw-text-xs tw-text-gray-500 tw-mb-0">Administrator</p>
            </div>
          </button>

          {profileOpen && (
            <div className="tw-w-[280px] tw-bg-white tw-border tw-border-gray-200 tw-shadow-md tw-absolute tw-right-0 tw-top-full tw-py-3 tw-z-50">
              <ul>
                <li>
                  <Link
                    href="/admin/profile"
                    className="tw-px-5 tw-py-2 hover:tw-bg-[#A6A182] hover:tw-text-white tw-block tw-w-full tw-text-left"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="tw-px-5 tw-py-2 hover:tw-bg-[#A6A182] hover:tw-text-white tw-block tw-w-full tw-text-left"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogOut}
                    className="tw-px-5 tw-py-2 hover:tw-bg-[#A6A182] hover:tw-text-white tw-block tw-w-full tw-text-left"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOverlay && (
        <div className="tw-fixed tw-left-0 tw-top-0 tw-w-full tw-h-full tw-bg-black/70 tw-z-50 tw-flex tw-justify-center tw-items-center">
          <div className="tw-w-[90%] tw-max-w-[500px] tw-bg-white tw-p-7 tw-rounded-md tw-relative">
            <form action="">
              <input
                type="text"
                className="tw-w-full tw-h-[46px] tw-border tw-border-gray tw-pr-12 tw-pl-5 tw-bg-stone-50 focus:tw-outline-0 tw-rounded-md"
                placeholder="Search for..."
              />
              <button className="tw-absolute tw-right-10 tw-top-11 tw-border-0 tw-bg-transparent">
                🔍
              </button>
            </form>
            <button
              onClick={() => setSearchOverlay(false)}
              className="tw-h-10 tw-w-10 tw-rounded-full tw-bg-gray tw-text-black hover:tw-bg-theme hover:tw-text-white tw-absolute -tw-top-5 -tw-right-5"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;