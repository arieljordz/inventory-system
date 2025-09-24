// src/hooks/useChartsData.js
import { useState, useEffect } from "react";
import { getDashboardCharts } from "../services/dashboardService";

export const useChartsData = () => {
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [revenueByPlatform, setRevenueByPlatform] = useState([]);
  const [profitByPlatform, setProfitByPlatform] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const { data } = await getDashboardCharts();
        console.log("charts response:", data);

        // ✅ Match backend field names
        setRevenueByMonth(data.revenueByMonth ?? []);
        setOrdersByMonth(data.ordersByMonth ?? []);
        setRevenueByPlatform(data.revenueByPlatform ?? []);
        setProfitByPlatform(data.profitByPlatform ?? []);
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
    revenueByMonth,
    ordersByMonth,
    revenueByPlatform,
    profitByPlatform,
  };
};
