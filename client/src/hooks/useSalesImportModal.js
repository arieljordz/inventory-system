// src/hooks/useSalesImportModal.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { importHandlers } from "../utils/importUtils";
import { useSpinner } from "../context/SpinnerContext";
import { PlatformEnum, CourierEnum } from "../enums/enums";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: CourierEnum.SPX,
  platform: PlatformEnum.SHOPEE,
  remarks: "",
};

export const useSalesImportModal = (refreshData) => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState("");
  const [form, setForm] = useState(initialFormState);

  const platformOptions = Object.entries(PlatformEnum).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  const openImportModal = useCallback((type) => {
    setImportType(type);
    setShowImportModal(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
    setImportType("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImport = useCallback(
    async (file, platform, importType) => {
      if (!file || !platform) {
        toast.error("Please select a platform and file.");
        return;
      }

      const handler = importHandlers[importType];
      if (!handler) {
        toast.error(`Unsupported import type: ${importType}`);
        return;
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("file", file);

      try {
        showSpinner();
        const res = await handler.api(formData);
        const { details } = res.data;

        handler.showResults(details, platform);
        await refreshData();
      } catch (err) {
        console.error(`${importType} import failed:`, err);
        toast.error(err.response?.data?.message || `Failed to import ${importType}.`);
      } finally {
        hideSpinner();
        closeImportModal();
      }
    },
    [refreshData, showSpinner, hideSpinner, closeImportModal]
  );

  return {
    showImportModal,
    importType,
    form,
    platformOptions,
    openImportModal,
    closeImportModal,
    handleChange,
    handleImport,
  };
};
