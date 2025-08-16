import React from "react";
import {
  formatAmount,
  formatDate,
  computeTotalPrice,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/common/StatusBadge";

const OrderTable = ({ orders = [], onOpenModal, loading = false }) => {
  const handleTagForPickup = (order) => {
    if (loading) return;
    onOpenModal?.(order);
  };

  const renderActionButtons = (order) => (
    <div className="btn-group" role="group">
      <button
        className="btn btn-sm btn-primary"
        title="Tag for Pick Up"
        onClick={() => handleTagForPickup(order)}
        disabled={loading}
      >
        <i className="fas fa-truck-loading"></i>
      </button>
    </div>
  );

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="10" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading orders...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <tr>
          <td colSpan="10" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-clipboard-list fa-2x mb-2 d-block"></i>
              No orders found
            </div>
          </td>
        </tr>
      );
    }

    return orders.map((order, index) => (
      <tr key={order._id || index} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          <code className="px-2 py-1 rounded">{order.sku || "N/A"}</code>
        </td>
        <td className="align-middle" title={order.name || ""}>
          {truncateText(order.name, 40) || "-"}
        </td>
        <td className="align-middle" title={order.description || ""}>
          {order.description ? (
            <span className="text-muted">
              {truncateText(order.description, 40)}
            </span>
          ) : (
            <span className="text-muted font-italic">No description</span>
          )}
        </td>
        <td className="text-center align-middle">
          {order.variant ? (
            <span className="badge badge-secondary">{order.variant}</span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td className="text-center align-middle">
          <span
            className={`badge ${
              order.quantity === 0
                ? "badge-danger"
                : order.quantity < 10
                ? "badge-warning"
                : "badge-success"
            }`}
          >
            {order.quantity ?? 0} {order.unit || "pcs"}
          </span>
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(computeTotalPrice(order.quantity, order.price))}
          </span>
        </td>
        <td className="text-center align-middle">
          <small className="text-muted">{formatDate(order.createdAt)}</small>
        </td>
        <td className="text-center align-middle">
          <StatusBadge
            status={order.status}
            customLabelMap={{
              Available: "In Stock",
              "For Pick Up": "Awaiting Pickup",
              "Out of Stock": "No Stock",
            }}
          />
        </td>
        <td className="text-center align-middle">
          {renderActionButtons(order)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-clipboard-list mr-2"></i>
          Orders
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
                <th className="text-center" style={{ width: "100px" }}>
                  SKU
                </th>
                <th style={{ width: "200px" }}>Product Name</th>
                <th>Description</th>
                <th className="text-center" style={{ width: "100px" }}>
                  Variant
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  Quantity
                </th>
                <th className="text-right" style={{ width: "120px" }}>
                  Total Price
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Added
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Status
                </th>
                <th className="text-center" style={{ width: "150px" }}>
                  Actions
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

export default OrderTable;
