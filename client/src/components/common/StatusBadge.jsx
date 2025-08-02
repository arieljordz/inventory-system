import React from "react";
import { getStatusBadgeData } from "../../utils/commonUtils";

const StatusBadge = ({ status, customColorMap = {} }) => {
  const { label, color } = getStatusBadgeData(status, customColorMap);
  return <span className={`badge badge-pill badge-${color}`}>{label}</span>;
};

export default StatusBadge;
