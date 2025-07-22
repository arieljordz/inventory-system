import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import bsCustomFileInput from "bs-custom-file-input";

import { StatusEnum } from "../../enums/enums";
import Navpath from "../../components/common/Navpath";
import AddProductModal from "../../components/products/AddProductModal";
import ProductTable from "../../components/products/ProductTable";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import RestockModal from "../../components/products/RestockModal";

import usePagination from "../../hooks/usePagination";
import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  restockProduct,
} from "../../services/productService";

// ----- Initial States -----
const initialFormState = {
  serialNumber: "",
  name: "",
  price: "",
  quantity: "",
  description: "",
  image: null,
};

const initialRestockForm = {
  productId: "",
  quantity: "",
  remarks: "",
  name: "",
};

const ProductsPage = () => {
  // ----- States -----
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [restockForm, setRestockForm] = useState(initialRestockForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // ----- Effects -----
  useEffect(() => {
    bsCustomFileInput.init();
    fetchProducts();
  }, []);

  // ----- Handlers -----
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      // console.log("Products:", data);
      setProducts(data);
    } catch {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      if (isEditMode) {
        await updateProduct(editingId, formData);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully.");
      }

      handleCloseAddModal();
      fetchProducts();
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong.";
      toast.error(
        msg === "Serial number already exists"
          ? "A product with this serial number already exists."
          : msg
      );
    }
  };

  const handleEdit = (product) => {
    setForm({
      serialNumber: product.serialNumber || "",
      name: product.name || "",
      price: product.price || "",
      quantity: product.quantity || "",
      description: product.description || "",
      image: null,
    });
    setEditingId(product._id);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted.");
        fetchProducts();
      } catch {
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  const handleOpenRestockModal = (product) => {
    setRestockForm({
      productId: product._id,
      quantity: "",
      remarks: "",
      name: product.name,
    });
    setShowRestockModal(true);
  };

  const handleCloseRestockModal = () => {
    setRestockForm(initialRestockForm);
    setShowRestockModal(false);
  };

  const handleRestockChange = (e) => {
    const { name, value } = e.target;
    setRestockForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value, 10) || "" : value,
    }));
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        quantity: Number(restockForm.quantity),
        remarks: restockForm.remarks || "Restock",
      };
      await restockProduct(restockForm.productId, payload);
      toast.success("Product restocked successfully.");
      handleCloseRestockModal();
      fetchProducts();
    } catch {
      toast.error("Failed to restock product.");
    }
  };

  const statusColorMap = {
    [StatusEnum.AVAILABLE]: "info", // blue
    [StatusEnum.FOR_PICK_UP]: "warning", // yellow
    [StatusEnum.TO_SHIP]: "primary", // dark blue
    [StatusEnum.SHIPPING]: "success", // green
    [StatusEnum.RETURNED]: "secondary", // gray — suitable for returned
    [StatusEnum.DELIVERED]: "teal", // teal (you can keep as "secondary" if "teal" not supported)
    [StatusEnum.COMPLETED]: "dark", // dark gray
    [StatusEnum.OUT_OF_STOCK]: "danger", // red — appropriate for no stock
  };

  // ----- Filtering and Pagination -----
  const filteredProducts = products.filter((product) => {
    const values = [
      product.serialNumber,
      product.name,
      product.price,
      product.description,
    ];
    return values.some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalItems = filteredProducts.length;
  const { indexOfFirstItem, indexOfLastItem, totalPages } = usePagination({
    totalItems,
    itemsPerPage,
    currentPage,
  });

  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ----- JSX -----
  return (
    <>
      <Navpath levelOne="Products" levelTwo="Home" levelThree="Products" />

      <section className="content">
        <div className="container-fluid">
          <div className="mb-3">
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <i className="fas fa-plus mr-1"></i> Add Product
            </button>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) =>
              setItemsPerPage(val === "All" ? totalItems : parseInt(val, 10))
            }
          />

          <ProductTable
            products={currentItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestock={handleOpenRestockModal}
            statusColorMap={statusColorMap}
          />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSubmitForm}
        isEditMode={isEditMode}
      />

      <RestockModal
        show={showRestockModal}
        restockForm={restockForm}
        onChange={handleRestockChange}
        onSubmit={handleRestockSubmit}
        onClose={handleCloseRestockModal}
      />
    </>
  );
};

export default ProductsPage;
