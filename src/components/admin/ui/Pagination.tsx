import React from "react";
import { Next, Prev } from "../svg";

interface PaginationProps {
  totalPage: number;
  currPage: number;
  setCurrPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination = ({ totalPage, currPage, setCurrPage }: PaginationProps) => {
  const getItemProps = (index: number) =>
    ({
      variant: currPage === index ? "filled" : "text",
      color: currPage === index ? "blue" : "blue-gray",
      onClick: () => setCurrPage(index),
      className: "tw-rounded-full",
    } as any);

  const next = () => {
    if (currPage === totalPage) return;
    setCurrPage(currPage + 1);
  };

  const prev = () => {
    if (currPage === 1) return;
    setCurrPage(currPage - 1);
  };

  return (
    <div className="tw-flex tw-justify-end tw-items-center tw-gap-4">
      <button
        className="tw-rounded-md tw-w-10 tw-h-10 tw-text-center tw-leading-[33px] tw-border tw-border-gray tw-last:mr-0 hover:tw-bg-theme hover:tw-text-white hover:tw-border-theme tw-inline-block tw-p-0"
        onClick={prev}
        disabled={currPage === 1}
      >
        <Prev />
      </button>
      <div className="tw-flex tw-items-center tw-gap-2">
        {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            {...getItemProps(n)}
            className={`tw-pagination-btn tw-text-base tw-inline-block tw-rounded-md tw-w-10 tw-h-10 tw-text-center tw-leading-[33px] tw-border tw-border-gray tw-last:mr-0 hover:tw-bg-theme hover:tw-text-white hover:tw-border-theme ${
              currPage === n ? "tw-bg-theme tw-text-white tw-border-theme" : ""
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        className="tw-rounded-md tw-w-10 tw-h-10 tw-text-center tw-leading-[33px] tw-border tw-border-gray tw-last:mr-0 hover:tw-bg-theme hover:tw-text-white hover:tw-border-theme tw-p-0 tw-inline-block"
        onClick={next}
        disabled={currPage === totalPage}
      >
        <Next />
      </button>
    </div>
  );
};

export default Pagination; 