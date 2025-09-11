// src/hooks/useOrdersData.js
import { useState, useEffect, useCallback } from "react";
import { getAllOrders, getOrderStatsByPlatform } from "../services/orderService";
import { useDebounce } from "./useDebounce";

export const useOrdersData = (initialItemsPerPage = 5) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  
  const [stats, setStats] = useState({
    overall: 0,
    shopee: 0,
    tiktok: 0,
    lazada: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { orders: fetchedOrders, totalOrders, totalPages } = res.data;

      setOrders(fetchedOrders || []);
      setTotalItems(totalOrders || 0);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    const fetch = async () => {
      await fetchOrders();
    };
    fetch();
  }, [fetchOrders]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchOrderStats = useCallback(async () => {
    try {
      const res = await getOrderStatsByPlatform();
      setStats(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setStats({
        availableProductCount: 0,
        totalAvailableQuantity: 0,
        totalInToday: 0,
        totalOutToday: 0,
      });
    }
  }, []);

  useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats]);

  return {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    fetchOrders,
    stats,
  };
};
