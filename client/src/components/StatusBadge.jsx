import React from "react";
import { getStatusBadgeData } from "../utils/commonUtils";

const StatusBadge = ({ status, customColorMap = {}, customLabelMap = {} }) => {
  const { label, color } = getStatusBadgeData(status, customColorMap, customLabelMap);

  return <span className={`badge badge-pill badge-${color}`}>{label}</span>;
};

export default StatusBadge;
