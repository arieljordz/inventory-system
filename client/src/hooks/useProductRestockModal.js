// src/hooks/useProductRestockModal.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { restockProduct } from "../services/productService";
import { useSpinner } from "../context/SpinnerContext";

export const useProductRestockModal = (refreshProducts) => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ _id: "", name: "", quantity: 1, remarks: "" });

  const open = useCallback((product) => {
    setForm({ _id: product._id, name: product.name, quantity: 1, remarks: "" });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setForm({ _id: "", name: "", quantity: 1, remarks: "" });
    setIsOpen(false);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      showSpinner();
      try {
        await restockProduct(form._id, {
          quantity: parseInt(form.quantity, 10),
          remarks: form.remarks || "Restock",
        });
        toast.success("Product restocked successfully!");
        close();
        await refreshProducts();
      } catch (err) {
        console.error("Restock error:", err);
        toast.error("Failed to restock product");
      } finally {
        hideSpinner();
      }
    },
    [form, showSpinner, hideSpinner, refreshProducts, close]
  );

  return { isOpen, form, open, close, handleChange, handleSubmit };
};
