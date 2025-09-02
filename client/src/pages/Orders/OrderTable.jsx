import React from "react";
import {
  formatAmount,
  formatDate,
  computeTotalPrice,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/StatusBadge";
import QuantityBadge from "../../components/QuantityBadge";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

const OrderTable = ({ orders = [], loading = false }) => {
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
              <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
              No imported orders found
            </div>
          </td>
        </tr>
      );
    }

    return orders.map((order, index) => (
      <tr key={order._id || index} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle small">
          {order.platform.toUpperCase() || "-"}
        </td>
        <td className="text-center align-middle">
          {order.platformOrderId ? (
            <div className="d-flex align-items-center justify-content-center">
              <code className="pr-2" title={order.platformOrderId}>
                {truncateText(order.platformOrderId, 80)}
              </code>
              <CopyToClipboardButton text={order.platformOrderId} />
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            <div
              className="font-weight-medium"
              title={order.product?.name || ""}
            >
              <code className="px-2 py-1 rounded">
                {truncateText(order.product?.name, 50)}
              </code>
            </div>
            <CopyToClipboardButton text={order.product?.name} />
          </div>
        </td>
        <td className="text-center align-middle">
          {order.product?.variant ? (
            <span className="badge badge-secondary">
              {order.product?.variant}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td className="text-center align-middle small">
          {order.courier || "-"}
        </td>
        <td className="text-center align-middle">
          <QuantityBadge quantity={order.quantity} unit={order.unit} />
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(
              computeTotalPrice(order.quantity, order.product?.price)
            )}
          </span>
        </td>
        <td className="text-center align-middle">
          <small className="text-muted">
            {formatDate(order.orderDate ?? order.createdAt)}
          </small>
        </td>
        <td className="text-center align-middle">
          <StatusBadge status={order.status} />
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-shopping-cart mr-2"></i>
          Imported Orders
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
                <th className="text-center" style={{ width: "120px" }}>
                  Platform
                </th>
                <th className="text-center" style={{ width: "180px" }}>
                  Platform Order ID
                </th>
                <th>Product Name</th>
                <th className="text-center" style={{ width: "100px" }}>
                  Variant
                </th>
                <th className="text-center" style={{ width: "150px" }}>
                  Courier
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  Quantity
                </th>
                <th className="text-right" style={{ width: "120px" }}>
                  Total Price
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Ordere Date
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Status
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
