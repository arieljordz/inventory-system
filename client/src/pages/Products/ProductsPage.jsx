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
import { verifyAction, confirmAction } from "../../hooks/useVerification";
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
    // Step 1: Verification
    const isVerified = await verifyAction();
    if (!isVerified) return;

    // Step 2: Confirmation
    const isConfirmed = await confirmAction({
      title: "Are you sure?",
      text: "This will permanently delete the product.",
      confirmText: "Yes, delete it!",
      confirmColor: "#d33",
    });
    if (!isConfirmed) return;

    // Step 3: Delete
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
