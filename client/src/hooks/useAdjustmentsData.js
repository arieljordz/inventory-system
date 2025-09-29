import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getProducts,
  getAllItems,
  applyAdjustment,
  getAdjustmentsByTarget,
} from "../services/adjustmentService";
import { useSpinner } from "../context/SpinnerContext";
import { useDebounce } from "./useDebounce";

export const useAdjustmentsData = (initialItemsPerPage = 5) => {
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
  const defaultAdjustment = {
    adjustmentType: "markup",
    valueType: "percentage",
    value: 0,
    notes: "",
  };
  const [adjustment, setAdjustment] = useState(defaultAdjustment);

  // 🔹 History
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);

  // 🔹 Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
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

  const resetAdjustmentForm = () => setAdjustment(defaultAdjustment);

  // ========= FETCH HANDLERS =========
  const fetchProducts = useCallback(
    async (page, limit, search) => {
      setLoading(true);
      try {
        const res = await getProducts({ page, limit, search });
        setProducts(res.data?.products || []);
        setTotalItems(res.data?.totalProducts || 0);

        if (page > res.data?.totalPages) {
          setCurrentPage(res.data?.totalPages || 1);
        }
        return res; // ✅ return response for chaining
      } catch (err) {
        console.error("Fetch products failed:", err);
        setProducts([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchItems = useCallback(
    async (page, limit, search) => {
      setLoading(true);
      try {
        const res = await getAllItems({ page, limit, search });
        setItems(res.data?.items || []);
        setTotalItems(res.data?.totalItems || 0);

        if (page > res.data?.totalPages) {
          setCurrentPage(res.data?.totalPages || 1);
        }
        return res; // ✅ return response for chaining
      } catch (err) {
        console.error("Fetch items failed:", err);
        setItems([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAdjustmentHistory = useCallback(async (targetType, targetId) => {
    try {
      const res = await getAdjustmentsByTarget(targetType, targetId);
      setAdjustmentHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch adjustment history:", err);
      toast.error("Failed to refresh adjustment history");
    }
  }, []);

  // ========= CENTRAL REFRESH =========
  const refreshData = useCallback(() => {
    if (activeTab === "products") {
      return fetchProducts(currentPage, itemsPerPage, debouncedSearchTerm);
    } else {
      return fetchItems(currentPage, itemsPerPage, debouncedSearchTerm);
    }
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm, fetchProducts, fetchItems]);

  // ========= EFFECTS =========
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    resetAdjustmentForm();
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

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to apply this price adjustment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, apply it!",
    });

    if (!result.isConfirmed) return;

    try {
      showSpinner();
      const targetType = getTargetType();

      const payload = {
        targetType,
        targetId: selected._id,
        ...adjustment,
      };

      await applyAdjustment(payload);

      resetAdjustmentForm();
      closeModal();

      // ✅ Centralized refresh
      const updatedList = await refreshData();

      // 🔹 Refresh history
      await fetchAdjustmentHistory(targetType, selected._id);

      // 🔹 Refresh selected details (from updated list)
      try {
        const fresh =
          activeTab === "products"
            ? updatedList?.data?.products?.find((p) => p._id === selected._id)
            : updatedList?.data?.items?.find((i) => i._id === selected._id);

        if (fresh) setSelected(fresh);
      } catch (err) {
        console.error("Failed to refresh selected:", err);
      }

      toast.success("Price adjusted successfully!");
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

    // Refresh
    refreshData,
  };
};
