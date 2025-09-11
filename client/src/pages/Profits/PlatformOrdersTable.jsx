import React from "react";
import {
  formatAmount,
  truncateText,
  formatDate,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/StatusBadge";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

const PlatformOrdersTable = ({ list, onView, loading }) => {
  const handleView = (order) => {
    if (!loading) onView?.(order);
  };

  const renderActionButtons = (order) => (
    <button
      className="btn btn-sm btn-primary"
      title="View Details"
      onClick={() => handleView(order)}
      disabled={loading}
    >
      <i className="fas fa-eye"></i>
    </button>
  );

  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status" />
              <span className="text-muted">Loading orders...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!list || list.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-4">
            <i className="fas fa-box-open fa-2x mb-2 d-block text-muted"></i>
            <span className="text-muted">No orders found</span>
          </td>
        </tr>
      );
    }

    return list.map((order, index) => (
      <tr key={order._id}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          {order.platform?.toUpperCase()}
        </td>
        <td className="text-center align-middle">
          {order.platformOrderId ? (
            <div className="d-flex align-items-center justify-content-center">
              <code className="pr-2">
                {truncateText(order.platformOrderId, 80)}
              </code>
              <CopyToClipboardButton text={order.platformOrderId} />
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="text-right text-danger align-middle">
          <span className="font-weight-bold">
            {formatAmount(order.totalOrderCost)}
          </span>
        </td>

        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(order.totalOrderRevenue)}
          </span>
        </td>
        <td className="text-right text-success align-middle">
          <span className="font-weight-bold">
            {formatAmount(order.totalOrderProfit)}
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
        <td className="text-center align-middle">
          {renderActionButtons(order)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="card mb-0">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-tags mr-2"></i> Platform Orders
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
                <th className="text-center">Platform</th>
                <th className="text-center">Order ID</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Profit</th>
                <th className="text-center">Order Date</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlatformOrdersTable;
