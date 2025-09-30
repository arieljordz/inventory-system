import React from "react";
import { FaEdit } from "react-icons/fa"; // using react-icons (FontAwesome)

const OrdersTable = ({ results, onSelect }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="card mt-3">
      <h5 className="m-3">Search Results</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Order Number</th>
              <th>Platform</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Date</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((order) => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{order.platform}</td>
                <td>{order.product?.name || "N/A"}</td>
                <td>{order.product?.variant || "N/A"}</td>
                <td>{order.status}</td>
                <td className="text-center">
                  {order.isPaid ? "✔️" : "❌"}
                </td>
                <td>
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1 mx-auto"
                    onClick={() => onSelect(order)}
                  >
                    <FaEdit /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
