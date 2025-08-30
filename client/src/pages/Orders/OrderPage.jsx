import React from "react";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import OrderTable from "./OrderTable";
import PickupModal from "./PickupModal";
import ImportModal from "./ImportModal";

import { useOrdersData } from "../../hooks/useOrdersData";
import { usePickupModal } from "../../hooks/usePickupModal";
import { useOrderImportModal } from "../../hooks/useOrderImportModal";

const OrderPage = () => {
  const {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    fetchOrders,
  } = useOrdersData(5);

  const pickup = usePickupModal(fetchOrders);
  const imp = useOrderImportModal(fetchOrders);

  return (
    <>
      <Navpath levelOne="Order Management" levelTwo="Home" levelThree="Orders" />

      <section className="content">
        <div className="container-fluid">
          {/* Import Button */}
          <div className="mb-3">
            <button className="btn btn-success" onClick={imp.openModal} disabled={loading}>
              <i className="fas fa-file-import mr-1"></i> Import Orders
            </button>
          </div>

          {/* Search */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            disabled={loading}
          />

          {/* Orders Table */}
          <OrderTable orders={orders} onOpenModal={pickup.openModal} loading={loading} />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            disabled={loading}
          />

          {/* Pickup Modal */}
          <PickupModal
            show={pickup.isOpen}
            selectedProduct={pickup.selectedProduct}
            form={pickup.form}
            getQuantity={() => pickup.selectedProduct?.quantity || 0}
            onClose={pickup.closeModal}
            onChange={pickup.handleChange}
            handleConfirmPickup={pickup.handleConfirmPickup}
          />

          {/* Import Modal */}
          <ImportModal
            show={imp.isOpen}
            onClose={imp.closeModal}
            form={imp.form}
            handleChange={imp.handleChange}
            handleImport={(file, platform) => imp.handleImport(file, platform)}
            platformOptions={imp.platformOptions}
          />
        </div>
      </section>
    </>
  );
};

export default OrderPage;
