import React from "react";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import { useProfitsData } from "../../hooks/useProfitsData";
import ProfitsTabs from "./ProfitsTabs";
import ProfitsTable from "./ProfitsTable";
import ProfitsModal from "./ProfitsModal";
import InfoDashboard from "./InfoDashboard";

const ProfitsPage = () => {
  const {
    activeTab,
    setActiveTab,
    platformOrders,
    walkInOrders,
    showModal,
    openModal,
    closeModal,
    selected,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    loading,
    stats,
  } = useProfitsData(5);

  // Choose which list to show depending on the active tab
  const list = activeTab === "platform-orders" ? platformOrders : walkInOrders;
  return (
    <>
      <Navpath
        levelOne="Cost & Profits"
        levelTwo="Home"
        levelThree="Cost & Profits"
      />

      <section className="content">
        <div className="container-fluid">
          {/* 🔹 Dashboard */}
          <InfoDashboard stats={stats} />

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
            <ProfitsTabs activeTab={activeTab} onChange={setActiveTab} />

            {/* Table */}
            <div className="card-body">
              <ProfitsTable
                list={list}
                onView={openModal}
                activeTab={activeTab}
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
          <ProfitsModal
            show={showModal}
            onClose={closeModal}
            selected={selected}
            activeTab={activeTab}
          />
        </div>
      </section>
    </>
  );
};

export default ProfitsPage;
