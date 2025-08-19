import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
} from "../../services/productService";
import { StatusEnum } from "../../enums/enums";
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import RestockModal from "./RestockModal";

import { useDebounce } from "../../hooks/useDebounce";
import ProductImport from "./ProductImport";

// Default form state
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

const ProductsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  // Core state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    _id: "",
    name: "",
    quantity: 1,
    remarks: "",
  });

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const {
        products: fetchedProducts,
        totalProducts,
        totalPages,
      } = response.data;

      // console.log(fetchedProducts);
      setProducts(fetchedProducts || []);
      setTotalItems(totalProducts || 0);

      // Adjust current page if it exceeds total pages
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // Event handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setForm(initialFormState);
    setIsEditMode(false);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((product) => {
    setForm({ ...product, image: product.image || null });
    setIsEditMode(true);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setForm(initialFormState);
    setIsModalOpen(false);
  }, []);

  // Form handlers
  const handleFormChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }, []);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      showSpinner();

      try {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
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

        closeModal();
        await fetchProducts();
      } catch (error) {
        console.error("Error saving product:", error);
        toast.error(
          isEditMode ? "Failed to update product" : "Failed to create product"
        );
      } finally {
        hideSpinner();
      }
    },
    [form, isEditMode, showSpinner, hideSpinner, closeModal, fetchProducts]
  );

  // Delete handler
  const handleDelete = useCallback(
    async (productId) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully!");
        await fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.error("Failed to delete product");
      }
    },
    [fetchProducts]
  );

  // Restock handlers
  const handleRestock = useCallback((product) => {
    setRestockForm({
      _id: product._id,
      name: product.name,
      quantity: 1,
      remarks: "",
    });
    setShowRestockModal(true);
  }, []);

  const handleRestockFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setRestockForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRestockSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      showSpinner();

      try {
        await restockProduct(restockForm._id, {
          quantity: parseInt(restockForm.quantity, 10),
          remarks: restockForm.remarks || "Restock",
        });

        toast.success("Product restocked successfully!");
        setShowRestockModal(false);
        await fetchProducts();
      } catch (error) {
        console.error("Restock error:", error);
        toast.error("Failed to restock product");
      } finally {
        hideSpinner();
      }
    },
    [restockForm, showSpinner, hideSpinner, fetchProducts]
  );

  const closeRestockModal = useCallback(() => {
    setShowRestockModal(false);
    setRestockForm({ _id: "", name: "", quantity: 1, remarks: "" });
  }, []);

  return (
    <>
      <Navpath
        levelOne="Product Management"
        levelTwo="Home"
        levelThree="Products"
      />

      <section className="content">
        <div className="container-fluid">
          {/* Add Product Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              disabled={loading}
            >
              <i className="fas fa-plus mr-1"></i> Add Product
            </button>
          </div>

          <ProductImport fetchProducts={fetchProducts} />
          {/* Search and Items Per Page Controls */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
          />

          {/* Product Table */}
          <ProductTable
            products={products}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onRestock={handleRestock}
            loading={loading}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={loading}
          />

          {/* Product Modal */}
          <ProductModal
            isOpen={isModalOpen}
            onClose={closeModal}
            form={form}
            onChange={handleFormChange}
            onSubmit={handleFormSubmit}
            isEditMode={isEditMode}
          />

          {/* Restock Modal */}
          <RestockModal
            show={showRestockModal}
            onClose={closeRestockModal}
            restockForm={restockForm}
            onChange={handleRestockFormChange}
            onSubmit={handleRestockSubmit}
          />
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
