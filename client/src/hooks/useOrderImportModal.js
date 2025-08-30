// src/hooks/useOrderImportModal.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { importOrdersByPlatform } from "../services/orderService";
import { useSpinner } from "../context/SpinnerContext";
import { PlatformEnum } from "../enums/enums";
import { showOrderImportResults } from "../utils/importUtils";

export const useOrderImportModal = (refreshOrders) => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ platform: PlatformEnum.SHOPEE });

  const platformOptions = Object.entries(PlatformEnum).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImport = useCallback(
    async (file, platform) => {
      if (!file || !platform) {
        toast.error("Please select a platform and file.");
        return;
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("file", file);

      try {
        showSpinner();
        const res = await importOrdersByPlatform(formData);
        const { details } = res.data;
        if (details) showOrderImportResults(details, platform);
        await refreshOrders();
      } catch (err) {
        console.error("Import failed:", err);
        toast.error(err.response?.data?.message || "Failed to import orders.");
      } finally {
        hideSpinner();
        closeModal();
      }
    },
    [form.platform, refreshOrders, showSpinner, hideSpinner]
  );

  return {
    isOpen,
    form,
    platformOptions,
    openModal,
    closeModal,
    handleChange,
    handleImport,
  };
};
