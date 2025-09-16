import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { createProduct, updateProduct } from "../services/productService";
import { useSpinner } from "../context/SpinnerContext";
import { StatusEnum } from "../enums/enums";

const initialFormState = {
  name: "",
  price: "",
  quantity: 0,
  description: "",
  category: "",
  unit: "pcs",
  status: StatusEnum.AVAILABLE,
  variant: "",
  type: "bundle",
  image: null,
  components: [], // ✅ single source of truth for bundle components
};

export const useProductModal = (refreshProducts) => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // Open Create
  const openCreate = useCallback(() => {
    setForm(initialFormState);
    setIsEditMode(false);
    setIsOpen(true);
  }, []);

  // Open Edit
  const openEdit = useCallback((product) => {
    setForm({
      ...initialFormState,
      ...product,
      components: product.components || [], // ✅ load existing components
      image: product.image || null,
    });
    setIsEditMode(true);
    setIsOpen(true);
  }, []);

  // Close Modal
  const close = useCallback(() => {
    setForm(initialFormState);
    setIsOpen(false);
    setIsEditMode(false);
  }, []);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name.includes("components")) {
      // handle nested components updates (not really needed anymore, since BundleSelector will handle updates)
      const [_, index, field] = name.split(".");
      setForm((prev) => {
        const newComponents = [...(prev.components || [])];
        newComponents[index] = { ...newComponents[index], [field]: value };
        return { ...prev, components: newComponents };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    }
  }, []);

  // --- utils to build formData ---
  const buildFormData = (data, alwaysInclude = ["variant"]) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // ✅ Always include certain fields (e.g., variant), even if empty
      if (alwaysInclude.includes(key)) {
        formData.append(key, value ?? "");
        return;
      }

      // ✅ Skip null/empty values for everything else
      if (value === null || value === "") return;

      // ✅ Special handling for components
      if (key === "components") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  };

  // --- submit handler ---
  const handleSubmit = useCallback(
    async (overrideForm) => {
      const dataToSubmit = overrideForm || form;

      // console.log("handleSubmit data:", dataToSubmit);

      showSpinner();
      try {
        const formData = buildFormData(dataToSubmit);

        // console.log("formData:", [...formData.entries()]);

        if (isEditMode) {
          await updateProduct(dataToSubmit._id, formData);
          toast.success("Product updated successfully!");
        } else {
          await createProduct(formData);
          toast.success("Product created successfully!");
        }

        close(); // ✅ reset after save
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
    setForm, // exposed for BundleSelector
    openCreate,
    openEdit,
    close,
    handleChange,
    handleSubmit,
  };
};
