// src/hooks/useProductModal.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { createProduct, updateProduct } from "../services/productService";
import { useSpinner } from "../context/SpinnerContext";
import { StatusEnum } from "../enums/enums";

const initialFormState = {
  name: "",
  price: "",
  quantity: "",
  description: "",
  sku: "",
  category: "",
  unit: "pcs",
  supplier: "",
  location: "Main Warehouse",
  status: StatusEnum.AVAILABLE,
  variant: "",
  image: null,
};

export const useProductModal = (refreshProducts) => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const openCreate = useCallback(() => {
    setForm(initialFormState);
    setIsEditMode(false);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((product) => {
    setForm({ ...product, image: product.image || null });
    setIsEditMode(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setForm(initialFormState);
    setIsOpen(false);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      showSpinner();
      try {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            formData.append(key, value);
          }
        });

        if (isEditMode) {
          await updateProduct(form._id, formData);
          toast.success("Product updated successfully!");
        } else {
          await createProduct(formData);
          toast.success("Product created successfully!");
        }

        close();
        await refreshProducts();
      } catch (err) {
        console.error("Save product error:", err);
        toast.error(
          isEditMode ? "Failed to update product" : "Failed to create product"
        );
      } finally {
        hideSpinner();
      }
    },
    [form, isEditMode, close, showSpinner, hideSpinner, refreshProducts]
  );

  return {
    isOpen,
    isEditMode,
    form,
    openCreate,
    openEdit,
    close,
    handleChange,
    handleSubmit,
  };
};
