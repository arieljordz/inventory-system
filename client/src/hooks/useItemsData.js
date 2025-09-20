// src/hooks/useItemsData.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  restockItem,
  getInventoryStats,
} from "../services/itemService";

import { useDebounce } from "./useDebounce";
import { useSpinner } from "../context/SpinnerContext";
import { verifyAction, confirmAction } from "./useVerification";

export const useItemsData = (initialPagination) => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination);
  const [stats, setStats] = useState({
    availableItemCount: 0,
    totalAvailableQuantity: 0,
    totalInToday: 0,
    totalOutToday: 0,
  });

  const debouncedSearch = useDebounce(pagination.searchTerm, 1000);
  const { showSpinner, hideSpinner } = useSpinner();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { currentPage, itemsPerPage } = pagination;
      const res = await getAllItems({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
      });

      const { items, totalItems } = res.data;
      setItems(items);
      setTotalItems(totalItems);

      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setPagination((prev) => ({ ...prev, currentPage: totalPages }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pagination, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearch]);

  const fetchItemStats = useCallback(async () => {
    try {
      const res = await getInventoryStats();
      setStats(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setStats({
        availableItemCount: 0,
        totalAvailableQuantity: 0,
        totalInToday: 0,
        totalOutToday: 0,
      });
    }
  }, []);

  useEffect(() => {
    fetchItemStats();
  }, [fetchItemStats]);

  const saveItem = async (form, isEditMode, onClose) => {
    showSpinner();
    try {
      console.log("form:", form);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "")
          formData.append(key, value);
      });

      console.log("formData:", formData);

      if (isEditMode) {
        await updateItem(form._id, formData);
        toast.success("Item updated successfully!");
      } else {
        await createItem(formData);
        toast.success("Item created successfully!");
      }

      onClose?.();
      await fetchItems();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        isEditMode
          ? error.response?.data?.message || "Failed to update item"
          : error.response?.data?.message || "Failed to create item"
      );
    } finally {
      hideSpinner();
    }
  };

  const removeItem = async (itemId) => {
    // Step 1: Verification
    const isVerified = await verifyAction();
    if (!isVerified) return;

    // Step 2: Confirmation
    const isConfirmed = await confirmAction({
      title: "Are you sure?",
      text: "This will permanently delete the item.",
      confirmText: "Yes, delete it!",
      confirmColor: "#d33",
    });
    if (!isConfirmed) return;

    // Step 3: Delete
    try {
      await deleteItem(itemId);
      toast.success("Item deleted successfully!");
      await fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete item");
    }
  };

  const restock = async (restockForm, onClose) => {
    showSpinner();
    try {
      await restockItem(restockForm._id, {
        quantity: parseInt(restockForm.quantity, 10),
        remarks: restockForm.remarks || "Restock",
      });

      toast.success("Item restocked successfully!");
      onClose?.();
      await fetchItems();
    } catch (error) {
      console.error("Restock error:", error);
      toast.error("Failed to restock item");
    } finally {
      hideSpinner();
    }
  };

  return {
    items,
    totalItems,
    loading,
    pagination,
    setPagination,
    fetchItems,
    saveItem,
    removeItem,
    restock,
    stats,
  };
};
