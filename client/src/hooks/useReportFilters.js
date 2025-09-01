import { useState, useEffect } from "react";
import { reportColumnsConfig } from "../utils/reportUtils";
import { getCurrentDate } from "../utils/commonUtils";
import { NewReportTypeEnum } from "../enums/enums";

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

  const handleResetFilters = () => {
    setFilters({
      paymentStatus: "All",
      movementType: "All",
      platform: "All",
      status: "All",
    });
    setStartDate(etCurrentDate());
    setEndDate(etCurrentDate());
  };

  return {
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filters,
    setFilters,
    handleFilterChange,
    handleResetFilters,
    columns,
  };
};
