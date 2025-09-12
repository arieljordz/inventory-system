// src/hooks/useOrderInventory.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getInventoryStats,
  getItemMovements,
  getRemainingPerProduct,
} from "../services/inventoryDetailService";
import { useDebounce } from "./useDebounce";
import { getCurrentDate } from "../utils/commonUtils";

export const useOrderInventory = (initialItemsPerPage = 5) => {
  const [movements, setMovements] = useState([]);
  const [remainingPerProduct, setRemainingPerProduct] = useState([]);
  const [stats, setStats] = useState({
    availableProductCount: 0,
    totalAvailableQuantity: 0,
    totalIn: 0,
    totalOut: 0,
  });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const [dateRange, setDateRange] = useState({
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      const [statsRes, movementsRes, remainingRes] = await Promise.all([
        getInventoryStats(startDate, endDate),
        getItemMovements({
          start: startDate,
          end: endDate,
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
        }),
        getRemainingPerProduct(),
      ]);

      const {
        movements: fetchedMovements,
        totalMovements,
        totalPages,
      } = movementsRes.data;

      setStats(statsRes.data);
      setMovements(fetchedMovements || []);
      setRemainingPerProduct(remainingRes.data || []);
      setTotalItems(totalMovements || 0);

      if (currentPage > totalPages && totalPages > 0)
        setCurrentPage(totalPages);
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
      setMovements([]);
      setRemainingPerProduct([]);
      setStats({
        availableProductCount: 0,
        totalAvailableQuantity: 0,
        totalIn: 0,
        totalOut: 0,
      });
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    const fetch = async () => {
      await fetchInventory();
    };
    fetch();
  }, [fetchInventory]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return {
    movements,
    remainingPerProduct,
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
    fetchInventory,
  };
};
