import React from "react";
import {
  formatAmount,
  formatDate,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/common/StatusBadge";

const ProductTable = ({ products = [], onEdit, onDelete, onRestock }) => {
  const renderActions = (product) => (
    <>
      <button
        className="btn btn-sm btn-info mr-1"
        title="Restock"
        onClick={() => onRestock?.(product)}
      >
        <i className="fas fa-plus" />
      </button>
      <button
        className="btn btn-sm btn-warning mr-1"
        title="Edit"
        onClick={() => onEdit?.(product)}
      >
        <i className="fas fa-edit" />
      </button>
      <button
        className="btn btn-sm btn-danger"
        title="Delete"
        onClick={() => onDelete?.(product._id)}
      >
        <i className="fas fa-trash-alt" />
      </button>
    </>
  );

  const renderRows = () =>
    products.length > 0 ? (
      products.map((product, index) => (
        <tr key={product._id}>
          <td className="text-center align-middle p-2">{index + 1}</td>
          <td className="text-center align-middle">{product.sku || "N/A"}</td>
          <td className="text-center align-middle">{product.name || "N/A"}</td>
          <td
            className="text-center align-middle"
            title={product.description || "-"}
          >
            {truncateText(product.description, 30)}
          </td>
          <td className="text-center align-middle">
            {product.variant || "N/A"}
          </td>
          <td className="text-right align-middle">
            {formatAmount(product.price)}
          </td>
          <td className="text-center align-middle">{product.quantity ?? 0}</td>
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
            {formatDate(product.createdAt)}
          </td>
          <td className="text-center align-middle">{renderActions(product)}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="10" className="text-center text-muted py-3">
          No products found.
        </td>
      </tr>
    );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Product List</h3>
      </div>
      <div className="card-body table-responsive p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead className="thead-light">
            <tr>
              <th className="text-center p-1">#</th>
              <th className="text-center">SKU</th>
              <th className="text-center">Product Name</th>
              <th className="text-center">Description</th>
              <th className="text-center">Variant</th>
              <th className="text-right">Price</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Status</th>
              <th className="text-center">Date Added</th>
              <th className="text-center" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
