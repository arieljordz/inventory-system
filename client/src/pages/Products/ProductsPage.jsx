import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import bsCustomFileInput from "bs-custom-file-input";
import Navpath from "../../components/common/Navpath";
import AddProductModal from "../../components/products/AddProductModal";
import ProductTable from "../../components/products/ProductTable";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  restockProduct,
} from "../../services/productService";
import RestockModal from "../../components/products/RestockModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    serialNumber: "",
    name: "",
    price: "",
    quantity: "", // ✅ added quantity
    description: "",
    image: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restockForm, setRestockForm] = useState({
    productId: "",
    quantity: "",
    remarks: "",
    name: "",
  });

  useEffect(() => {
    bsCustomFileInput.init();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      serialNumber: "",
      name: "",
      price: "",
      quantity: "", // ✅ reset quantity
      description: "",
      image: null,
    });
    setIsEditMode(false);
    setEditingId(null);
    document.getElementById("image").value = "";
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
    const formData = new FormData();
    for (let key in form) {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    }

    try {
      if (isEditMode) {
        await updateProduct(editingId, formData);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(formData); // ✅ createProduct expects quantity
        toast.success("Product created successfully.");
      }
      fetchProducts();
      window.$("#addProductModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error(error);
      const errorMsg =
        error?.response?.data?.message || "Something went wrong.";
      if (errorMsg === "Serial number already exists") {
        toast.error("A product with this serial number already exists.");
      } else {
        toast.error(errorMsg);
      }
    }
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
      } catch (err) {
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleEdit = (product) => {
    setIsEditMode(true);
    setEditingId(product._id);
    setForm({
      serialNumber: product.serialNumber || "",
      name: product.name || "",
      price: product.price || "",
      quantity: product.quantity || "",
      description: product.description || "",
      image: null,
    });
    window.$("#addProductModal").modal("show");
  };

  const handleRestock = (product) => {
    setRestockForm({
      productId: product._id,
      quantity: "",
      remarks: "",
      name: product.name,
    });
    window.$("#restockModal").modal("show");
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

    console.log("Sending to backend:", payload);

    await restockProduct(restockForm.productId, payload);

    toast.success("Product restocked successfully.");
    window.$("#restockModal").modal("hide");
    fetchProducts();
  } catch (err) {
    toast.error("Failed to restock.");
  }
};

  // ===== Filtering and Pagination =====
  const filteredData = products.filter((product) => {
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

  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : parseInt(itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredData.length / itemsPerPageValue);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navpath levelOne="Products" levelTwo="Home" levelThree="Products" />

      <section className="content">
        <div className="container-fluid">
          <div className="mb-3">
            <button
              className="btn btn-primary"
              data-toggle="modal"
              data-target="#addProductModal"
              onClick={resetForm}
            >
              <i className="fas fa-plus mr-1"></i>
              Add Product
            </button>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
          <ProductTable
            products={currentData}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRestock={handleRestock}
          />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            onPageChange={paginate}
          />
        </div>
      </section>

      <AddProductModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEditMode={isEditMode}
      />

      <RestockModal
        restockForm={restockForm}
        onChange={handleRestockChange}
        onSubmit={handleRestockSubmit}
      />
    </>
  );
};

export default ProductsPage;
