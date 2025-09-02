// src/hooks/useChartsData.js
import { useState, useEffect } from "react";
import { getDashboardCharts } from "../services/dashboardService";

export const useChartsData = () => {
  const [areaChartData, setAreaChartData] = useState([]);
  const [donutChartData, setDonutChartData] = useState([]);
  const [monthlyDonutChartData, setMonthlyDonutChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const { data } = await getDashboardCharts();
        console.log("charts response:", data);

        // ✅ Data already structured in backend
        setAreaChartData(data.areaChartData ?? []);
        setDonutChartData(data.donutChartData ?? []);
        setMonthlyDonutChartData(data.monthlyDonutChartData ?? []);
      } catch (error) {
        console.error("Error fetching dashboard charts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    loading,
    areaChartData,
    donutChartData,
    monthlyDonutChartData,
  };
};
