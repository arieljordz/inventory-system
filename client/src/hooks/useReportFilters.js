import { useState, useEffect } from "react";
import { reportColumnsConfig } from "../utils/reportUtils";
import { getCurrentDate } from "../utils/commonUtils";

export const useReportFilters = (initialReportType) => {
  const [reportType, setReportType] = useState(initialReportType);
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [filters, setFilters] = useState({
    paymentStatus: "All",
    movementType: "All",
    platform: "All",
    status: "All",
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const columns = reportColumnsConfig[reportType] || [];

  return {
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filters,
    handleFilterChange,
    columns,
  };
};
