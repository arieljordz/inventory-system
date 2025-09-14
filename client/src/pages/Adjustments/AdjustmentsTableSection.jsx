// AdjustmentsTableSection.jsx
import React from "react";
import AdjustmentsTable from "./AdjustmentsTable";
import PaginationControls from "../../components/PaginationControls";

const AdjustmentsTableSection = ({
  list,
  activeTab,
  onAdjust,
  loading,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  return (
    <div className="card-body">
      <AdjustmentsTable
        list={list}
        activeTab={activeTab}
        onAdjust={onAdjust}
        loading={loading}
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        disabled={loading}
      />
    </div>
  );
};

export default AdjustmentsTableSection;
