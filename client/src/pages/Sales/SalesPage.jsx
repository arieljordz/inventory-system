import React from "react";
import Navpath from "../../components/Navpath";
import { InfoBox } from "../../components/FormInputs";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import SalesTable from "./SalesTable";
import ImportModal from "./ImportModal";
import ImportButtons from "./ImportButtons";
import { formatAmount } from "../../utils/commonUtils";
import { useSalesData } from "../../hooks/useSalesData";
import { useSalesImportModal } from "../../hooks/useSalesImportModal";

const SalesPage = () => {
  /** 🔹 Custom hooks */
  const {
    orders,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    fetchSales,
  } = useSalesData(5);

  const {
    showImportModal,
    importType,
    form,
    platformOptions,
    openImportModal,
    closeImportModal,
    handleChange,
    handleImport,
  } = useSalesImportModal(fetchSales);

  return (
    <>
      <Navpath levelOne="Sales Management" levelTwo="Home" levelThree="Sales" />

      <section className="content">
        <div className="container-fluid">
          {/* 🔹 Info Boxes */}
          <div className="row">
            <InfoBox label="Monthly Sales" icon="fas fa-coins" color="success" value={formatAmount(stats.totalSales)} />
            <InfoBox label="Monthly Orders" icon="fas fa-receipt" color="primary" value={stats.totalOrders} />
            <InfoBox label="Paid Orders" icon="fas fa-check-circle" color="info" value={stats.paidOrders} />
            <InfoBox label="Unpaid Orders" icon="fas fas fa-times-circle" color="danger" value={stats.unpaidOrders} />
          </div>

          {/* 🔹 Import Buttons */}
          <ImportButtons
            loading={loading}
            onImportSales={() => openImportModal("sales")}
            onImportReturned={() => openImportModal("returned")}
          />

          {/* 🔹 Search & Pagination */}
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

          {/* 🔹 Sales Table */}
          <SalesTable orders={orders} loading={loading} />

          {/* 🔹 Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            disabled={loading}
          />

          {/* 🔹 Import Modal */}
          <ImportModal
            show={showImportModal}
            onClose={closeImportModal}
            form={form}
            handleChange={handleChange}
            handleImport={(file, platform, importType) => handleImport(file, platform, importType)}
            platformOptions={platformOptions}
            importType={importType}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;
