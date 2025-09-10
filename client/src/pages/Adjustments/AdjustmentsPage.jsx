import React from "react";
import Navpath from "../../components/Navpath";
import { useAdjustments } from "../../hooks/useAdjustments";
import TabSwitcher from "./TabSwitcher";
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
    loading,
  } = useAdjustments({
    currentPage: 1,
    itemsPerPage: 5,
    searchTerm: "",
  });

  // Choose which list to show depending on the active tab
  const list =
    activeTab === "products" ? products?.products || [] : items?.items || [];

  return (
    <>
      <Navpath
        levelOne="Price Adjustments"
        levelTwo="Home"
        levelThree="Price Adjustments"
      />

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            {/* Tabs */}
            <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

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
