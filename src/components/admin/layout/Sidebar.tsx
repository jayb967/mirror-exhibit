"use client";

import React, { useState } from "react";
import sidebar_menu from "@/data/admin/sidebar-menus";
import DownArrow from "../svg/DownArrow";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Props type
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [isDropdown, setIsDropDown] = useState<string>("");
  const router = useRouter();

  // Handle active menu
  const handleMenuActive = (title: string) => {
    if (title === isDropdown) {
      setIsDropDown("");
    } else {
      setIsDropDown(title);
    }
  };

  // Handle logout
  const handleLogOut = () => {
    // Will be implemented with Supabase auth
    router.push(`/admin/login`);
  };

  return (
    <>
      <aside
        className={`tw-w-[300px] lg:tw-w-[250px] xl:tw-w-[300px] tw-border-r tw-border-gray tw-overflow-y-auto tw-sidebar-scrollbar tw-fixed tw-left-0 tw-top-0 tw-h-full tw-bg-white tw-z-50 tw-transition-transform tw-duration-300 ${
          sidebarOpen ? "tw-translate-x-[0px]" : " -tw-translate-x-[300px] lg:tw-translate-x-[0]"
        }`}
      >
        <div className="tw-flex tw-flex-col tw-justify-between tw-h-full">
          <div>
            <div className="tw-py-4 tw-pb-8 tw-px-8 tw-border-b tw-border-gray tw-h-[78px]">
              <Link href="/admin/dashboard">
                <div className="tw-text-xl tw-font-bold">Mirror Exhibit Admin</div>
              </Link>
            </div>
            <div className="tw-px-4 tw-py-5">
              <ul>
                {sidebar_menu.map((menu) => (
                  <li key={menu.id}>
                    {!menu.subMenus && (
                      <Link
                        href={menu.link}
                        onClick={() => handleMenuActive(menu.title)}
                        className="tw-group tw-rounded-md tw-relative tw-text-black tw-text-[16px] tw-font-medium tw-inline-flex tw-items-center tw-w-full tw-transition-colors tw-ease-in-out tw-duration-300 tw-px-5 tw-py-[9px] tw-mb-2 hover:tw-bg-gray tw-sidebar-link-active"
                      >
                        <span className="tw-inline-block tw-mr-[10px] tw-text-xl">
                          <menu.icon />
                        </span>
                        {menu.title}

                        {menu.subMenus && (
                          <span className="tw-absolute tw-right-4 tw-top-[52%] tw-transition-transform tw-duration-300 tw-origin-center tw-w-4 tw-h-4">
                            <DownArrow />
                          </span>
                        )}
                      </Link>
                    )}
                    {menu.subMenus && (
                      <a
                        onClick={() => handleMenuActive(menu.title)}
                        className={`tw-group tw-cursor-pointer tw-rounded-md tw-relative tw-text-black tw-text-[16px] tw-font-medium tw-inline-flex tw-items-center tw-w-full tw-transition-colors tw-ease-in-out tw-duration-300 tw-px-5 tw-py-[9px] tw-mb-2 hover:tw-bg-gray tw-sidebar-link-active ${
                          isDropdown === menu.title ? "tw-bg-themeLight hover:tw-bg-themeLight tw-text-theme" : ""
                        }`}
                      >
                        <span className="tw-inline-block tw-mr-[10px] tw-text-xl">
                          <menu.icon />
                        </span>
                        {menu.title}

                        {menu.subMenus && (
                          <span className="tw-absolute tw-right-4 tw-top-[52%] tw-transition-transform tw-duration-300 tw-origin-center tw-w-4 tw-h-4">
                            <DownArrow />
                          </span>
                        )}
                      </a>
                    )}

                    {menu.subMenus && (
                      <ul
                        className={`tw-pl-[42px] tw-pr-[20px] tw-pb-3 ${isDropdown === menu.title ? "tw-block" : "tw-hidden"}`}
                      >
                        {menu.subMenus.map((sub, i) => (
                          <li key={i}>
                            <Link
                              href={sub.link}
                              className="tw-block tw-font-normal tw-w-full tw-text-[#6D6F71] hover:tw-text-theme tw-nav-dot tw-text-[14px]"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="tw-text-center tw-mb-6">
            <button
              onClick={handleLogOut}
              className="tw-px-7 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`tw-fixed tw-top-0 tw-left-0 tw-w-full tw-h-full tw-z-40 tw-bg-black/70 tw-transition-all tw-duration-300 ${
          sidebarOpen ? "tw-visible tw-opacity-1" : "tw-invisible tw-opacity-0"
        }`}
      ></div>
    </>
  );
}