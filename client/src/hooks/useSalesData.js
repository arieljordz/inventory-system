// src/hooks/useSalesData.js
import { useState, useEffect, useCallback } from "react";
import { getSalesStatsByDate } from "../services/salesService";
import { getCurrentDate, getPastWeekDate } from "../utils/commonUtils";
import { useDebounce } from "./useDebounce";

export const useSalesData = (initialItemsPerPage = 5) => {
  /** Core state */
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    revenueToday: 0,
    unpaidOrders: 0,
  });
  const [loading, setLoading] = useState(false);

  /** Search & pagination */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  /** Date filter */
  const [dateRange, setDateRange] = useState({
    startDate: getPastWeekDate(),
    endDate: getCurrentDate(),
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // console.log("dateRange:", dateRange);

  /** Fetch sales */
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      const res = await getSalesStatsByDate({
        start: startDate,
        end: endDate,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const {
        orders: fetchedOrders,
        totalOrders,
        totalPages,
        totalSales,
        unpaidOrders,
        revenueToday,
      } = res.data;

      setOrders(fetchedOrders || []);
      setStats({
        totalOrders: totalOrders ?? 0,
        totalSales: totalSales ?? 0,
        unpaidOrders: unpaidOrders ?? 0,
        revenueToday: revenueToday ?? 0,
      });
      setTotalItems(totalOrders || 0);

      // fix overflow page
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      setOrders([]);
      setStats({});
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return {
    orders,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    dateRange,
    setDateRange,
    fetchSales,
  };
};
