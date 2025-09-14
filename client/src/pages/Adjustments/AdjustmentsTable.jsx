import React from "react";
import ProductsTable from "./ProductsTable";
import ItemsTable from "./ItemsTable";

// 🔹 Action Buttons (shared only here)
const ActionButtons = ({ item, loading, onAdjust, type }) => (
  <div className="btn-group" role="group">
    <button
      className="btn btn-sm btn-success"
      title="Adjust Price"
      onClick={() => !loading && onAdjust?.(item, type, item._id)}
      disabled={loading}
    >
      <i className="fas fa-sliders-h"></i>
    </button>
  </div>
);

// 🔹 Table State Row (shared only here)
const TableStateRow = ({ loading, activeTab }) => (
  <tr>
    <td
      colSpan={activeTab === "products" ? "7" : "6"}
      className="text-center py-4"
    >
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary mr-2" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <span className="text-muted">Loading {activeTab}...</span>
        </div>
      ) : (
        <div className="text-muted">
          <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
          No {activeTab} found
        </div>
      )}
    </td>
  </tr>
);

const AdjustmentsTable = ({ list = [], activeTab, onAdjust, loading = false }) => {
  return (
    <div className="card mb-0">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-tags mr-2"></i>
          {activeTab === "products" ? "Products" : "Items"}
        </h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          {activeTab === "products" ? (
            <ProductsTable
              list={list}
              loading={loading}
              onAdjust={onAdjust}
              ActionButtons={ActionButtons}
              TableStateRow={TableStateRow}
            />
          ) : (
            <ItemsTable
              list={list}
              loading={loading}
              onAdjust={onAdjust}
              ActionButtons={ActionButtons}
              TableStateRow={TableStateRow}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdjustmentsTable;
