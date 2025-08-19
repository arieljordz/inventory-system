import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";

import { getProductsByStatus } from "../../services/productService";
import { tagInventoryForPickUp } from "../../services/inventoryDetailService";
import { importOrdersByPlatform } from "../../services/orderService";

import { StatusEnum, PlatformEnum, CourierEnum } from "../../enums/enums";

import OrderTable from "./OrderTable";
import PickupModal from "./PickupModal";
import ImportModal from "./ImportModal";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

import { useDebounce } from "../../hooks/useDebounce";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: CourierEnum.SPX,
  platform: PlatformEnum.SHOPEE,
  remarks: "",
};

const OrderPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  // Core state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Pickup modal state
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pickupForm, setPickupForm] = useState(initialFormState);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);

  // Platform options
  const platformOptions = Object.entries(PlatformEnum).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  /** 🔹 Fetch Orders */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductsByStatus({
        status: StatusEnum.AVAILABLE,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });
      const { products: fetchedOrders, totalProducts, totalPages } = res.data;

      setOrders(fetchedOrders || []);
      setTotalItems(totalProducts || 0);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page on search change
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  /** 🔹 Event Handlers */
  const handleSearchChange = useCallback((val) => setSearchTerm(val), []);
  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);
  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  /** 🔹 Pickup Modal Handlers */
  const openPickupModal = useCallback((product) => {
    setSelectedProduct(product);
    setPickupForm(initialFormState);
    setIsPickupModalOpen(true);
  }, []);
  const closePickupModal = useCallback(() => {
    setSelectedProduct(null);
    setPickupForm(initialFormState);
    setIsPickupModalOpen(false);
  }, []);
  const handlePickupChange = useCallback((e) => {
    const { name, value } = e.target;
    setPickupForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleConfirmPickup = useCallback(async () => {
    const qty = Number(pickupForm.quantity);
    if (!qty || qty <= 0 || qty > selectedProduct.quantity) {
      toast.error("Invalid quantity.");
      return;
    }

    try {
      showSpinner();
      await tagInventoryForPickUp(
        {
          quantity: qty,
          platform: pickupForm.platform,
          platformOrderId: pickupForm.platformOrderId,
          courier: pickupForm.courier,
          remarks: pickupForm.remarks,
        },
        selectedProduct._id
      );

      toast.success("Product tagged for pickup!");
      closePickupModal();
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to tag product.");
    } finally {
      hideSpinner();
    }
  }, [pickupForm, selectedProduct, fetchOrders, closePickupModal, showSpinner, hideSpinner]);

  /** 🔹 Import Modal Handlers */
  const openImportModal = useCallback(() => setShowImportModal(true), []);
  const closeImportModal = useCallback(() => setShowImportModal(false), []);

  const handleImport = useCallback(
    async (file, platform) => {
      if (!file || !platform) {
        toast.error("Please select a platform and file.");
        return;
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("file", file);

      try {
        showSpinner();
        const res = await importOrdersByPlatform(formData);
        const { details } = res.data;

        if (details?.skipped?.length) {
          const skippedMessages = details.skipped.map(
            (item, idx) =>
              `#${idx + 1} (${item.platformOrderId}): ${item.reason}`
          );

          Swal.fire({
            icon: "warning",
            title: "Import Completed with Issues",
            html: `<div style="max-height:300px; overflow:auto">${skippedMessages.join(
              "<br>"
            )}</div>`,
            width: "40em",
          });
        } else {
          toast.success("Orders imported successfully!");
        }

        await fetchOrders();
      } catch (err) {
        console.error("Import failed:", err);
        toast.error(err.response?.data?.message || "Failed to import orders.");
      } finally {
        hideSpinner();
        closeImportModal();
      }
    },
    [fetchOrders, showSpinner, hideSpinner]
  );

  return (
    <>
      <Navpath levelOne="Order Management" levelTwo="Home" levelThree="Orders" />

      <section className="content">
        <div className="container-fluid">
          {/* Import Button */}
          <div className="mb-3">
            <button
              className="btn btn-success"
              onClick={openImportModal}
              disabled={loading}
            >
              <i className="fas fa-file-import mr-1"></i> Import Orders
            </button>
          </div>

          {/* Search & Items Per Page */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
          />

          {/* Orders Table */}
          <OrderTable
            orders={orders}
            onOpenModal={openPickupModal}
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

          {/* Pickup Modal */}
          <PickupModal
            show={isPickupModalOpen}
            selectedProduct={selectedProduct}
            form={pickupForm}
            getQuantity={() => selectedProduct?.quantity || 0}
            onClose={closePickupModal}
            onChange={handlePickupChange}
            handleConfirmPickup={handleConfirmPickup}
          />

          {/* Import Modal */}
          <ImportModal
            show={showImportModal}
            onClose={closeImportModal}
            form={pickupForm}
            handleChange={handlePickupChange}
            handleImport={handleImport}
            platformOptions={platformOptions}
          />
        </div>
      </section>
    </>
  );
};

export default OrderPage;
