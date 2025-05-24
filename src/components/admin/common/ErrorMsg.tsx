import React from "react";

type ErrorMsgProps = {
  msg: string;
};

const ErrorMsg = ({ msg }: ErrorMsgProps) => {
  return <div className="tw-text-red-500">{msg}</div>;
};

export default ErrorMsg; 