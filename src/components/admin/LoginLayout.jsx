"use client";

import React from "react";

const LoginLayout = ({ children }) => {
  return (
    <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-flex-col tw-justify-center tw-py-12 sm:tw-px-6 lg:tw-px-8">
      <div className="sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-md">
        <h2 className="tw-mt-6 tw-text-center tw-text-3xl tw-font-extrabold tw-text-gray-900">
          Mirror Exhibit Admin
        </h2>
      </div>

      <div className="tw-mt-8 sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-md">
        <div className="tw-bg-white tw-py-8 tw-px-4 tw-shadow sm:tw-rounded-lg sm:tw-px-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
