import React from "react";
import { formatAmount } from "../../utils/commonUtils";

const AdjustmentsTable = ({
  list = [],
  activeTab,
  onAdjust,
  loading = false,
}) => {
  console.log("List:", list);
  const handleAdjust = (item) => {
    if (loading) return;
    onAdjust?.(item, activeTab === "products" ? "Product" : "Item", item._id);
  };

  const renderActionButtons = (item) => (
    <div className="btn-group" role="group">
      <button
        className="btn btn-sm btn-warning"
        title="Adjust Price"
        onClick={() => handleAdjust(item)}
        disabled={loading}
      >
        <i className="fas fa-sliders-h"></i>
      </button>
    </div>
  );

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading {activeTab}...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!list || list.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
              No {activeTab} found
            </div>
          </td>
        </tr>
      );
    }

    return list.map((item, index) => (
      <tr key={item._id} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          <code className="px-2 py-1 rounded">{item.sku || "N/A"}</code>
        </td>
        <td className="align-middle">
          <span className="font-weight-medium">{item.name}</span>
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">{formatAmount(item.price)}</span>
        </td>
        <td className="text-center align-middle">
          {renderActionButtons(item)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-tags mr-2"></i>
          {activeTab === "products" ? "Products" : "Items"}
        </h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="thead-light">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>
                  #
                </th>
                <th className="text-center" style={{ width: "150px" }}>
                  SKU
                </th>
                <th className="text-left" style={{ width: "250px" }}>
                  Name
                </th>
                <th className="text-right" style={{ width: "150px" }}>
                  Current Price
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentsTable;
