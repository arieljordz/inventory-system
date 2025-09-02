import React from "react";
import Navpath from "../../components/Navpath";
import { InfoBox } from "../../components/FormInputs";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import DateRangeFilter from "../../components/DateRangeFilter";
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
    dateRange,
    setDateRange,
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
            <InfoBox label="Total Sales" icon="fas fa-money-bill-wave" color="success" value={formatAmount(stats.totalSales)} />
            <InfoBox label="Total Orders" icon="fas fa-receipt" color="primary" value={stats.totalOrders} />
            <InfoBox label="Revenue Today" icon="fas fa-calendar-day" color="info" value={formatAmount(stats.revenueToday)} />
            <InfoBox label="Unpaid Orders" icon="fas fa-clock" color="danger" value={stats.unpaidOrders} />
          </div>

          {/* 🔹 Date Filter */}
          <DateRangeFilter dateRange={dateRange} onDateChange={setDateRange} onFilter={fetchSales} />

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
            handleImport={(file, platform) => handleImport(file, platform, importType)}
            platformOptions={platformOptions}
            importType={importType}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;
