import React from "react";
import {
  formatAmount,
  formatDate,
  computeTotalPrice,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/common/StatusBadge";

const OrderTable = ({ orders = [], onOpenModal }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Available Products</h3>
      </div>

      <div className="card-body table-responsive p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead>
            <tr>
              <th className="text-center p-1">#</th>
              <th className="text-center">SKU</th>
              <th className="text-center">Name</th>
              <th className="text-center">Description</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Total Price</th>
              <th className="text-center">Date Added</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((product, index) => (
                <tr key={product._id || index}>
                  <td className="text-center align-middle p-2">{index + 1}</td>
                  <td className="text-center align-middle">
                    {product.sku || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {product.name || "-"}
                  </td>
                  <td
                    className="text-center align-middle"
                    title={product.description || "-"}
                  >
                    {truncateText(product.description, 30)}
                  </td>
                  <td className="text-center align-middle">
                    {product.quantity || 0}
                  </td>
                  <td className="text-right align-middle">
                    {formatAmount(
                      computeTotalPrice(product.quantity, product.price)
                    )}
                  </td>
                  <td className="text-center align-middle">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="text-center align-middle">
                    <StatusBadge
                      status={product.status}
                      customLabelMap={{
                        Available: "In Stock",
                        "For Pick Up": "Awaiting Pickup",
                        "Out of Stock": "No Stock",
                      }}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onOpenModal(product)}
                      title="Tag for Pick Up"
                    >
                      <i className="fas fa-truck-loading mr-1"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
