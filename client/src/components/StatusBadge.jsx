import React from "react";
import { StatusEnum } from "../enums/enums";

const StatusBadge = ({ status }) => {
  // map enum values to bootstrap badge colors
  const statusConfig = {
    [StatusEnum.AVAILABLE]: { label: StatusEnum.AVAILABLE, color: "success" },
    [StatusEnum.OUT_OF_STOCK]: { label: StatusEnum.OUT_OF_STOCK, color: "danger" },
    [StatusEnum.ON_PROCESS]: { label: StatusEnum.ON_PROCESS, color: "warning" },
    [StatusEnum.RETURNED]: { label: StatusEnum.RETURNED, color: "secondary" },
    [StatusEnum.COMPLETED]: { label: StatusEnum.COMPLETED, color: "primary" },
  };

  const { label, color } = statusConfig[status] || {
    label: status,
    color: "light",
  };

  return <span className={`badge badge-pill badge-${color}`}>{label}</span>;
};

export default StatusBadge;
