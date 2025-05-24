import React from "react";

export const Delete = () => (
  <svg
    className="tw-mx-auto tw-inline"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const Edit = () => (
  <svg
    className="tw-mx-auto tw-inline"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export const Prev = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" 
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="tw-h-4 tw-w-4 tw-mx-auto"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

export const Next = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" 
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="tw-h-4 tw-w-4 tw-mx-auto"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
); 