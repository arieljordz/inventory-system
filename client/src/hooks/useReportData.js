// hooks/useReportData.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { generateReport } from "../services/reportService.js";

export const useReportData = (reportType) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = useCallback(
    async ({ reportType, startDate, endDate, filters }) => {
      try {
        setLoading(true);

        const payload = {
          reportType,
          startDate,
          endDate,
          filters,
        };

        console.log("payload:", payload);
        const response = await generateReport(payload);

        if (response?.data?.success) {
          setReportData(response.data.data || []);
        } else {
          setReportData([]);
          toast.error("Failed to fetch report data");
        }
      } catch (err) {
        console.error(err);
        setReportData([]);
        toast.error("Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setReportData([]);
  }, [reportType]);

  return { reportData, loading, fetchReportData };
};
