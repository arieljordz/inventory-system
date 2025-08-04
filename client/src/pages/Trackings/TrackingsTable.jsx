import React from "react";
import {
  formatAmount,
  formatDate,
  computeTotalPrice,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/common/StatusBadge";

const TrackingsTable = ({ orders = [] }) => {
  // console.log("orders:", orders);
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Order List</h3>
      </div>

      <div className="card-body table-responsive p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead>
            <tr>
              <th className="text-center p-1">#</th>
              <th className="text-center">Platform</th>
              <th className="text-center">Platform OrderId</th>
              <th className="text-center">SKU</th>
              <th className="text-center">Name</th>
              <th className="text-center">Courier</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Total Price</th>
              <th className="text-center">Date Ordered</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-muted py-4">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order._id || index}>
                  <td className="text-center align-middle p-2">{index + 1}</td>
                  <td className="text-center align-middle">
                    {order.platform || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {order.platformOrderId || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {order.product.sku || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {order.product.name || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {order.courier || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {order.quantity || 0}
                  </td>
                  <td className="text-right align-middle">
                    {formatAmount(
                      computeTotalPrice(order.quantity, order.product.price)
                    )}
                  </td>
                  <td className="text-center align-middle">
                    {formatDate(order.createdAt)}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackingsTable;
