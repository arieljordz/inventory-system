// src/hooks/useOrdersData.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getProductsByStatus } from "../services/productService";
import { useDebounce } from "./useDebounce";
import { StatusEnum } from "../enums/enums";

export const useOrdersData = (initialItemsPerPage = 5) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductsByStatus({
        status: StatusEnum.AVAILABLE,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { products: fetchedOrders, totalProducts, totalPages } = res.data;
      setOrders(fetchedOrders || []);
      setTotalItems(totalProducts || 0);

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
  };
};
