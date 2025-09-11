import React from "react";
import { formatAmount, formatDate } from "../../utils/commonUtils";
import StatusBadge from "../../components/StatusBadge";

const WalkInTransactionsTable = ({ list, onView, loading }) => {
  const handleView = (tx) => {
    if (!loading) onView?.(tx);
  };

  const renderActionButtons = (tx) => (
    <button
      className="btn btn-sm btn-primary"
      title="View Details"
      onClick={() => handleView(tx)}
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
              <span className="text-muted">Loading transactions...</span>
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
            <span className="text-muted">No transactions found</span>
          </td>
        </tr>
      );
    }

    return list.map((tx, index) => (
      <tr key={tx._id}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          {tx.buyerName || "Walk-in Customer"}
        </td>
        <td className="text-center align-middle">{tx.paymentMethod || "-"}</td>
        <td className="text-right text-danger align-middle">
          <span className="font-weight-bold">
            {formatAmount(tx.totalTransactionCost)}
          </span>
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(tx.totalTransactionRevenue)}
          </span>
        </td>
        <td className="text-right text-success align-middle">
          <span className="font-weight-bold">
            {formatAmount(tx.totalTransactionProfit)}
          </span>
        </td>
        <td className="text-center align-middle">
          <small className="text-muted">{formatDate(tx.createdAt)}</small>
        </td>
        <td className="text-center align-middle">
          <StatusBadge status={"Completed"} />
        </td>
        <td className="text-center align-middle">{renderActionButtons(tx)}</td>
      </tr>
    ));
  };

  return (
    <div className="card mb-0">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-cash-register mr-2"></i> Walk-In Transactions
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
                <th className="text-center">Customer</th>
                <th className="text-center">Payment Method</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Profit</th>
                <th className="text-center">Purchase Date</th>
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

export default WalkInTransactionsTable;
