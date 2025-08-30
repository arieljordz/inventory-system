// src/hooks/usePickupModal.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { tagInventoryForPickUp } from "../services/inventoryDetailService";
import { useSpinner } from "../context/SpinnerContext";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: "",
  platform: "",
  remarks: "",
};

export const usePickupModal = (refreshOrders) => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialFormState);

  const openModal = (product) => {
    setSelectedProduct(product);
    setForm(initialFormState);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setForm(initialFormState);
    setIsOpen(false);
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleConfirmPickup = useCallback(async () => {
    const qty = Number(form.quantity);
    if (!qty || qty <= 0 || qty > selectedProduct?.quantity) {
      toast.error("Invalid quantity.");
      return;
    }

    try {
      showSpinner();
      await tagInventoryForPickUp(
        {
          quantity: qty,
          platform: form.platform,
          platformOrderId: form.platformOrderId,
          courier: form.courier,
          remarks: form.remarks,
        },
        selectedProduct._id
      );
      toast.success("Product tagged for pickup!");
      closeModal();
      await refreshOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to tag product.");
    } finally {
      hideSpinner();
    }
  }, [form, selectedProduct, refreshOrders, showSpinner, hideSpinner]);

  return {
    isOpen,
    selectedProduct,
    form,
    openModal,
    closeModal,
    handleChange,
    handleConfirmPickup,
  };
};
