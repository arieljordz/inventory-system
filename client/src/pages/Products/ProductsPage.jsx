import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";
import RestockModal from "./RestockModal";
import ProductImport from "./ProductImport";
import ProductExport from "./ProductExport";

import { useProductsData } from "../../hooks/useProductsData";
import { useProductModal } from "../../hooks/useProductModal";
import { useProductRestockModal } from "../../hooks/useProductRestockModal";
import { deleteProduct } from "../../services/productService";
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
  } = useProductsData(5);

  const productModal = useProductModal(fetchProducts);
  const restockModal = useProductRestockModal(fetchProducts);

  const handleDelete = async (productId) => {
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
          <ProductImport fetchProducts={fetchProducts} />
          <ProductExport fetchProducts={fetchProducts} />

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
          <ProductTable
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
          <ProductModal
            isOpen={productModal.isOpen}
            onClose={productModal.close}
            form={productModal.form}
            setForm={productModal.setForm}
            onChange={productModal.handleChange}
            onSubmit={productModal.handleSubmit}
            isEditMode={productModal.isEditMode}
          />

          {/* Restock Modal */}
          <RestockModal
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
