import React from "react";

type EditTooltipProps = {
  showEdit: boolean;
};

const EditTooltip = ({ showEdit }: EditTooltipProps) => {
  return (
    <div
      className={`${
        showEdit ? "tw-flex" : "tw-hidden"
      } tw-flex-col tw-items-center tw-z-50 tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-bottom-full tw-mb-1`}
    >
      <span className="tw-relative tw-z-10 tw-p-2 tw-text-tiny tw-leading-none tw-font-medium tw-text-white tw-whitespace-nowrap tw-w-max tw-bg-slate-800 tw-rounded tw-py-1 tw-px-2 tw-inline-block">
        Edit
      </span>
      <div className="tw-w-3 tw-h-3 -tw-mt-2 tw-rotate-45 tw-bg-black"></div>
    </div>
  );
};

export default EditTooltip; 