import React from "react";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import { useAdjustmentsData } from "../../hooks/useAdjustmentsData";
import AdjustmentsTabs from "./AdjustmentsTabs";
import AdjustmentsTable from "./AdjustmentsTable";
import AdjustmentsModal from "./AdjustmentsModal";

const AdjustmentsPage = () => {
  const {
    activeTab,
    setActiveTab,
    products,
    items,
    showModal,
    openModal,
    closeModal,
    selected,
    adjustment,
    handleChange,
    handleApply,
    adjustmentHistory,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    loading,
  } = useAdjustmentsData(5);

  // Choose which list to show depending on the active tab
  const list = activeTab === "products" ? products : items;

  return (
    <>
      <Navpath
        levelOne="Price Adjustments"
        levelTwo="Home"
        levelThree="Price Adjustments"
      />

      <section className="content">
        <div className="container-fluid">
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

          <div className="card">
            {/* Tabs */}
            <AdjustmentsTabs activeTab={activeTab} onChange={setActiveTab} />

            {/* Table */}
            <div className="card-body">
              <AdjustmentsTable
                list={list}
                activeTab={activeTab}
                onAdjust={openModal}
                loading={loading}
              />
            </div>
          </div>
          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
          {/* Modal */}
          <AdjustmentsModal
            show={showModal}
            onClose={closeModal}
            selected={selected}
            adjustment={adjustment}
            onChange={handleChange}
            onApply={handleApply}
            adjustmentHistory={adjustmentHistory}
            activeTab={activeTab}
          />
        </div>
      </section>
    </>
  );
};

export default AdjustmentsPage;
