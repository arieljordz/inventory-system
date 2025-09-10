import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getProducts,
  getAllItems,
  applyAdjustment,
  getAdjustmentsByTarget,
} from "../services/adjustmentService";
import { useSpinner } from "../context/SpinnerContext";
import { useDebounce } from "./useDebounce";

export const useAdjustments = (initialItemsPerPage) => {
  const { showSpinner, hideSpinner } = useSpinner();

  // 🔹 Tabs & Data
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  // 🔹 Modal state
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Adjustment form
  const [adjustment, setAdjustment] = useState({
    adjustmentType: "markup",
    valueType: "percentage",
    value: 0,
    notes: "",
  });

  // 🔹 History
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);

  // 🔹 Loading & Pagination
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  // ========== CRUD Operations ==========

  // 📌 Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { data, total, totalPages } = res;
      setProducts(data || []);
      setTotalItems(total || 0);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
  }, [fetchProducts, activeTab]);

  // 📌 Fetch Items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllItems({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { data, total, totalPages } = res;
      setItems(data || []);
      setTotalItems(total || 0);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Fetch items failed:", error);
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    if (activeTab === "items") fetchItems();
  }, [fetchItems, activeTab]);

  // Reset pagination when search changes
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // 📌 Handle opening modal
  const openModal = async (row, targetType, targetId) => {
    setSelected(row);
    setShowModal(true);
    try {
      showSpinner();
      const res = await getAdjustmentsByTarget(targetType, targetId);
      setAdjustmentHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load adjustment history:", err);
    } finally {
      hideSpinner();
    }
  };

  const closeModal = () => {
    setSelected(null);
    setShowModal(false);
    setAdjustment({
      adjustmentType: "markup",
      valueType: "percentage",
      value: 0,
      notes: "",
    });
    setAdjustmentHistory([]);
  };

  // 📌 Handle form change (generic)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdjustment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 📌 Apply adjustment
  const handleApply = async (e) => {
    if (e) e.preventDefault();
    if (!selected) return;

    try {
      showSpinner();
      const payload = {
        targetType: activeTab === "products" ? "Product" : "Item",
        targetId: selected._id,
        ...adjustment,
      };
      await applyAdjustment(payload);
      toast.success("Price adjusted successfully!");

      // Refresh history
      const historyRes = await getAdjustmentsByTarget(
        payload.targetType,
        payload.targetId
      );
      setAdjustmentHistory(historyRes.data || []);

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply adjustment");
    } finally {
      hideSpinner();
    }
  };

  // ========== Expose API ==========
  return {
    // Tabs
    activeTab,
    setActiveTab,

    // Data
    products,
    items,

    // Modal
    showModal,
    openModal,
    closeModal,
    selected,

    // Form
    adjustment,
    handleChange,
    handleApply,

    // History
    adjustmentHistory,

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
  };
};
