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

export const useAdjustments = (initialItemsPerPage = 5) => {
  const { showSpinner, hideSpinner } = useSpinner();

  // 🔹 Tabs
  const [activeTab, setActiveTab] = useState("products"); // "products" | "items"

  // 🔹 Data
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  // 🔹 Modal
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

  // 🔹 Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  // 🔹 Loading
  const [loading, setLoading] = useState(false);

  // ========= HELPERS =========
  const getTargetType = useCallback(
    (tab = activeTab) => (tab === "products" ? "Product" : "Item"),
    [activeTab]
  );

  // ========= FETCH HANDLERS =========
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      setProducts(res.data?.products || []);
      setTotalItems(res.data?.totalProducts || 0);

      if (currentPage > res.data?.totalPages) {
        setCurrentPage(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllItems({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      setItems(res.data?.items || []);
      setTotalItems(res.data?.totalItems || 0);

      if (currentPage > res.data?.totalPages) {
        setCurrentPage(res.data?.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch items failed:", err);
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchAdjustmentHistory = useCallback(async (targetType, targetId) => {
    try {
      const res = await getAdjustmentsByTarget(targetType, targetId);
      setAdjustmentHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch adjustment history:", err);
      toast.error("Failed to refresh adjustment history");
    }
  }, []);

  // ========= EFFECTS =========
  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    else fetchItems();
  }, [activeTab, fetchProducts, fetchItems]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when search changes
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when switching tabs
  }, [activeTab]);

  // ========= MODAL =========
  const openModal = async (row) => {
    const targetType = getTargetType();
    setSelected(row);
    setShowModal(true);

    try {
      showSpinner();
      await fetchAdjustmentHistory(targetType, row._id);
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
    // Keep history for debugging if needed
  };

  // ========= FORM =========
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdjustment((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = async (e) => {
    if (e) e.preventDefault();
    if (!selected) return;

    try {
      showSpinner();
      const targetType = getTargetType();

      const payload = {
        targetType,
        targetId: selected._id,
        ...adjustment,
      };

      await applyAdjustment(payload);
      toast.success("Price adjusted successfully!");

      // Refresh history (keep modal open)
      await fetchAdjustmentHistory(targetType, selected._id);

      //   closeModal();
      setAdjustment({
        adjustmentType: "markup",
        valueType: "percentage",
        value: 0,
        notes: "",
      });
      if (activeTab === "products") {
        fetchProducts();
      } else {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply adjustment");
    } finally {
      hideSpinner();
    }
  };

  // ========= RETURN =========
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
