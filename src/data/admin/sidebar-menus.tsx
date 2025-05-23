import { ISidebarMenus } from "../../types/admin/menu-types";
import React from "react";
import { AiOutlineDashboard, AiOutlineUser, AiOutlineSetting } from "react-icons/ai";
import { HiOutlinePhotograph, HiOutlineUserGroup } from "react-icons/hi";
import { TbDiscountCheck, TbCategory, TbTruckDelivery } from "react-icons/tb";
import { GrGallery } from "react-icons/gr";
import { PiArticle } from "react-icons/pi";
import { MdOutlinePayment, MdOutlineLocalShipping } from "react-icons/md";
import { RiCoupon3Line } from "react-icons/ri";
import { BellIcon, ChartBarIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { SidebarMenuItems } from "@/types/admin/menu-types";

// SVG Icon Components
const Dashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const Products = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 01-8 0"></path>
  </svg>
);

const Categories = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const Orders = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
  </svg>
);

const Coupons = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

const Profile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Setting = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const Pages = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const Leaf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const StuffUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Define the sidebar menu data
const sidebar_menu: SidebarMenuItems = [
  {
    id: 1,
    title: "Dashboard",
    icon: AiOutlineDashboard,
    link: "/admin/dashboard",
  },
  {
    id: 2,
    title: "Analytics",
    icon: ChartBarIcon,
    link: "/admin/analytics",
  },
  {
    id: 3,
    title: "Notifications",
    icon: BellIcon,
    link: "/admin/notifications",
  },
  {
    id: 4,
    title: "Orders",
    icon: ShoppingBagIcon,
    link: "#",
    subMenus: [
      {
        title: "All Orders",
        link: "/admin/orders",
      },
      {
        title: "Enhanced Orders",
        link: "/admin/orders/enhanced",
      },
    ],
  },
  {
    id: 5,
    title: "Gallery",
    icon: GrGallery,
    link: "/admin/gallery",
  },
  {
    id: 6,
    title: "Exhibitions",
    icon: HiOutlinePhotograph,
    link: "#",
    subMenus: [
      {
        title: "All Exhibitions",
        link: "/admin/exhibitions",
      },
      {
        title: "Add Exhibition",
        link: "/admin/exhibitions/add",
      },
      {
        title: "Categories",
        link: "/admin/exhibitions/categories",
      },
    ],
  },
  {
    id: 7,
    title: "Artists",
    icon: AiOutlineUser,
    link: "#",
    subMenus: [
      {
        title: "All Artists",
        link: "/admin/artists",
      },
      {
        title: "Add Artist",
        link: "/admin/artists/add",
      },
    ],
  },
  {
    id: 8,
    title: "Guest Users",
    icon: HiOutlineUserGroup,
    link: "/admin/guests",
  },
  {
    id: 9,
    title: "Blog",
    icon: PiArticle,
    link: "#",
    subMenus: [
      {
        title: "All Posts",
        link: "/admin/blog",
      },
      {
        title: "Add Post",
        link: "/admin/blog/add",
      },
      {
        title: "Categories",
        link: "/admin/blog/categories",
      },
    ],
  },
  {
    id: 10,
    title: "Media",
    icon: HiOutlinePhotograph,
    link: "/admin/media",
  },
  {
    id: 11,
    title: "Shipping",
    icon: MdOutlineLocalShipping,
    link: "#",
    subMenus: [
      {
        title: "Shipping Rules",
        link: "/admin/shipping/rules",
      },
      {
        title: "Shipping Settings",
        link: "/admin/shipping/settings",
      },
    ],
  },
  {
    id: 12,
    title: "Coupons",
    icon: RiCoupon3Line,
    link: "/admin/coupons",
  },
  {
    id: 13,
    title: "Tickets",
    icon: TbDiscountCheck,
    link: "/admin/tickets",
  },
  {
    id: 14,
    title: "Payments",
    icon: MdOutlinePayment,
    link: "/admin/payments",
  },
  {
    id: 15,
    title: "Settings",
    icon: AiOutlineSetting,
    link: "/admin/settings",
  },
];

export default sidebar_menu;