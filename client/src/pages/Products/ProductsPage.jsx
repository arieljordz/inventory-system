import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import ProductsTable from "./ProductsTable";
import ProductsModal from "./ProductsModal";
import RestockProductsModal from "./RestockProductsModal";
import ProductsImport from "./ProductsImport";
import ProductsExport from "./ProductsExport";
import InfoDashboard from "./InfoDashboard";

import { useProductsData } from "../../hooks/useProductsData";
import { useProductModal } from "../../hooks/useProductModal";
import { useProductRestockModal } from "../../hooks/useProductRestockModal";
import { deleteProduct } from "../../services/productService";
import { VerificationCodeEnum } from "../../enums/enums";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    fetchProducts,
    stats,
  } = useProductsData(5);

  const productModal = useProductModal(fetchProducts);
  const restockModal = useProductRestockModal(fetchProducts);

  const handleDelete = async (productId) => {
    const verificationResult = await Swal.fire({
      title: "Verification Required",
      text: "Please enter the verification code to proceed with deletion:",
      input: "text",
      inputPlaceholder: "Enter verification code",
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Verify",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.style.textAlign = "center";
          input.style.fontSize = "18px";
          input.style.fontWeight = "bold";
          input.style.letterSpacing = "2px";
        }
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("Please enter a verification code");
          return false;
        }
        if (value !== VerificationCodeEnum.VERIFICATION_CODE) {
          Swal.showValidationMessage("Invalid verification code");
          return false;
        }
        return true;
      },
    });

    if (!verificationResult.isConfirmed) {
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
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
           {/* 🔹 Dashboard */}
          <InfoDashboard stats={stats} />

          {/* Add Product Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary"
              onClick={productModal.openCreate}
              disabled={loading}
            >
              <i className="fas fa-plus mr-1"></i> Add Product
            </button>
          </div>

          {/* Import / Export */}
          <ProductsImport fetchProducts={fetchProducts} />
          <ProductsExport fetchProducts={fetchProducts} />

          {/* Search */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            disabled={loading}
          />

          {/* Table */}
          <ProductsTable
            products={products}
            onEdit={productModal.openEdit}
            onDelete={handleDelete}
            onRestock={restockModal.open}
            loading={loading}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            disabled={loading}
          />

          {/* Product Modal */}
          <ProductsModal
            isOpen={productModal.isOpen}
            onClose={productModal.close}
            form={productModal.form}
            setForm={productModal.setForm}
            onChange={productModal.handleChange}
            onSubmit={productModal.handleSubmit}
            isEditMode={productModal.isEditMode}
          />

          {/* Restock Modal */}
          <RestockProductsModal
            show={restockModal.isOpen}
            onClose={restockModal.close}
            restockForm={restockModal.form}
            onChange={restockModal.handleChange}
            onSubmit={restockModal.handleSubmit}
          />
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
