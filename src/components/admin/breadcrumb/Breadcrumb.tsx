import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  subtitle: string;
  subChild?: boolean;
}

const Breadcrumb = ({
  title,
  subtitle,
  subChild = true,
}: BreadcrumbProps) => {
  return (
    <div className="tw-flex tw-justify-between tw-mb-10">
      <div className="tw-page-title">
        <h3 className="tw-mb-0 tw-text-[28px]">{title}</h3>
        {subChild && (
          <ul className="tw-text-tiny tw-font-medium tw-flex tw-items-center tw-space-x-3 tw-text-text3">
            <li className="tw-breadcrumb-item tw-text-muted">
              <Link href="/admin/dashboard" className="tw-text-hover-primary">
                Home
              </Link>
            </li>
            <li className="tw-breadcrumb-item tw-flex tw-items-center">
              <span className="tw-inline-block tw-bg-text3/60 tw-w-[4px] tw-h-[4px] tw-rounded-full"></span>
            </li>
            <li className="tw-breadcrumb-item tw-text-muted">{subtitle}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb; 