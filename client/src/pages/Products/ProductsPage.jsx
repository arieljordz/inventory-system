import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import RestockModal from "./RestockModal";

const initialFormState = {
  serialNumber: "",
  name: "",
  price: "",
  quantity: "",
  description: "",
  image: null,
};

const ProductsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    _id: "",
    name: "",
    quantity: 1,
    remarks: "",
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products
  const filteredBySearch = useMemo(() => {
    return products.filter((item) =>
      ["serialNumber", "name", "price", "description"].some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  // Modal controls
  const openCreateModal = () => {
    setForm(initialFormState);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    console.log("product:", product);
    setForm({ ...product, image: product.image || "" });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setForm(initialFormState);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showSpinner(); // 👈 Start spinner

    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      }

      if (isEditMode) {
        await updateProduct(form._id, formData);
      } else {
        await createProduct(formData);
      }

      const res = await getProducts();
      setProducts(res.data);
      closeModal();
    } catch (err) {
      console.error("Error saving product", err);
    } finally {
      hideSpinner(); // 👈 Stop spinner regardless of error/success
    }
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProduct(productId);
      const res = await getProducts();
      setProducts(res.data);

      Swal.fire({
        title: "Deleted!",
        text: "Product has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete product.",
        icon: "error",
      });
    }
  };

  const handleRestock = (product) => {
    setRestockForm({
      _id: product._id,
      name: product.name,
      quantity: 1,
      remarks: "",
    });
    setShowRestockModal(true);
  };

  const handleRestockFormChange = (e) => {
    const { name, value } = e.target;
    setRestockForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    showSpinner();

    try {
      await restockProduct(restockForm._id, {
        quantity: restockForm.quantity,
        remarks: restockForm.remarks || "Restock",
      });

      toast.success("Product restocked successfully!");
      setShowRestockModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Restock error:", error);
      // toast.error("Failed to restock product");
    } finally {
      hideSpinner();
    }
  };

  return (
    <>
      <Navpath
        levelOne="Product Management"
        levelTwo="Home"
        levelThree="Products"
      />
      <section className="content">
        <div className="container-fluid">
          <button className="btn btn-primary mb-3" onClick={openCreateModal}>
            <i className="fas fa-plus mr-1"></i> Add Product
          </button>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          <ProductTable
            products={paginatedItems}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onRestock={handleRestock}
          />

          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />

          <ProductModal
            isOpen={isModalOpen}
            onClose={closeModal}
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isEditMode={isEditMode}
          />

          <RestockModal
            show={showRestockModal}
            onClose={() => setShowRestockModal(false)}
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
