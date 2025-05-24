"use client";

import React from "react";

// Prop type
interface NotificationAreaProps {
  nRef: React.RefObject<HTMLDivElement>;
  notificationOpen: boolean;
  handleNotificationOpen: () => void;
}

const NotificationArea = ({
  nRef,
  notificationOpen,
  handleNotificationOpen,
}: NotificationAreaProps) => {
  // Sample notification data
  const notifications = [
    {
      id: 1,
      name: "John Doe",
      amount: 150,
      time: "2023-05-10T10:30:00.000Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      amount: 225,
      time: "2023-05-09T15:20:00.000Z",
    },
    {
      id: 3,
      name: "Mike Johnson",
      amount: 75,
      time: "2023-05-08T08:15:00.000Z",
    },
  ];

  const formatTime = (time: string) => {
    const date = new Date(time);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div ref={nRef}>
      <button
        onClick={handleNotificationOpen}
        className="tw-relative tw-w-[40px] tw-h-[40px] tw-leading-[40px] tw-rounded-md tw-text-gray tw-border tw-border-gray hover:tw-bg-themeLight hover:tw-text-theme hover:tw-border-themeLight"
      >
        🔔
        <span className="tw-w-[20px] tw-h-[20px] tw-inline-block tw-bg-danger tw-rounded-full tw-absolute -tw-top-[4px] -tw-right-[4px] tw-border-[2px] tw-border-white tw-text-xs tw-leading-[18px] tw-font-medium tw-text-white">
          {notifications.length}
        </span>
      </button>

      {notificationOpen && (
        <div className="tw-absolute tw-w-[280px] sm:tw-w-[350px] tw-h-auto tw-top-full -tw-right-[60px] sm:tw-right-0 tw-shadow-lg tw-rounded-md tw-bg-white tw-py-5 tw-px-5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="tw-flex tw-items-center tw-justify-between tw-last:border-0 tw-border-b tw-border-gray tw-pb-4 tw-mb-4 tw-last:pb-0 tw-last:mb-0"
            >
              <div className="tw-flex tw-items-center tw-space-x-3">
                <div className="">
                  <div
                    className="tw-w-[40px] tw-h-[40px] tw-rounded-md tw-bg-gray-200 tw-flex tw-items-center tw-justify-center"
                  >
                    👤
                  </div>
                </div>
                <div className="">
                  <h6 className="tw-font-medium tw-text-gray-500 tw-mb-0">
                    {item.name}{" "}
                    <span className="tw-font-bold">${item.amount}</span> USD order!
                  </h6>
                  <div className="tw-flex tw-items-center tw-mt-2">
                    <span
                      className="tw-text-[11px] tw-px-2 tw-py-1 tw-rounded-md tw-leading-none tw-text-success tw-bg-success/10 tw-font-medium"
                    >
                      New Order
                    </span>

                    <span className="tw-text-tiny tw-leading-none tw-ml-2">
                      {formatTime(item.time)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="">
                <button className="hover:tw-text-danger">
                  ✖️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationArea;