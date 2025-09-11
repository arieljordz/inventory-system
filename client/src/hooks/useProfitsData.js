import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getProfitStats,
  getOrdersWithProfits,
  getWalkInTransactionsWithProfits,
} from "../services/profitsService";
import { useSpinner } from "../context/SpinnerContext";
import { useDebounce } from "./useDebounce";

export const useProfitsData = (initialItemsPerPage = 5) => {
  const { showSpinner, hideSpinner } = useSpinner();

  // 🔹 Tabs
  const [activeTab, setActiveTab] = useState("platform-orders");

  // 🔹 Data
  const [platformOrders, setPlatformOrders] = useState([]);
  const [walkInOrders, setWalkInOrders] = useState([]);

  // 🔹 Modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const [stats, setStats] = useState({
    overallOrders: 0,
    overallCost: 0,
    overallRevenue: 0,
    overallProfit: 0,
  });

  // 🔹 Loading
  const [loading, setLoading] = useState(false);

  // ========= FETCH HANDLERS =========
  const fetchPlatformOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrdersWithProfits({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      // console.log("orders:", res.data?.orders);
      setPlatformOrders(res.data?.orders || []);
      setTotalItems(res.data?.totalOrders || 0);

      if (currentPage > res.data?.totalPages) {
        setCurrentPage(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch platformOrders failed:", err);
      setPlatformOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchWalkInOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWalkInTransactionsWithProfits({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      // console.log("transactions:", res.data?.transactions);
      setWalkInOrders(res.data?.transactions || []);
      setTotalItems(res.data?.totalTransactions || 0);

      if (currentPage > res.data?.totalPages) {
        setCurrentPage(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch walkInOrders failed:", err);
      setWalkInOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  // ========= EFFECTS =========
  useEffect(() => {
    if (activeTab === "platform-orders") fetchPlatformOrders();
    else fetchWalkInOrders();
  }, [activeTab, fetchPlatformOrders, fetchWalkInOrders]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when search changes
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when switching tabs
  }, [activeTab]);

  // ========= MODAL =========
  const openModal = async (row) => {
    setSelected(row);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelected(null);
    setShowModal(false);
  };

  const fetchProfitStats = useCallback(async () => {
    try {
      const res = await getProfitStats();
      setStats(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setStats({
        overallOrders: 0,
        overallCost: 0,
        overallRevenue: 0,
        overallProfit: 0,
      });
    }
  }, []);

  useEffect(() => {
    fetchProfitStats();
  }, [fetchProfitStats]);

  // ========= RETURN =========
  return {
    // Tabs
    activeTab,
    setActiveTab,

    // Data
    platformOrders,
    walkInOrders,

    // Modal
    showModal,
    openModal,
    closeModal,
    selected,

    // Search & Pagination
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,

    // Loading
    loading,
    stats,
  };
};
