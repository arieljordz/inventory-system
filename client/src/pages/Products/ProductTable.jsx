import React, { useState } from "react";
import {
  formatAmount,
  formatDate,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/StatusBadge";
import QuantityBadge from "../../components/QuantityBadge";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  onRestock,
  loading = false,
}) => {
  // console.log("Rendering ProductTable with products:", products);
  const handleEdit = (product) => {
    if (loading) return;
    onEdit?.(product);
  };

  const handleDelete = (productId) => {
    if (loading) return;
    onDelete?.(productId);
  };

  const handleRestock = (product) => {
    if (loading) return;
    onRestock?.(product);
  };

  const renderActionButtons = (product) => (
    <div className="btn-group" role="group">
      <button
        className="btn btn-sm btn-info"
        title="Restock Product"
        onClick={() => handleRestock(product)}
        disabled={loading}
      >
        <i className="fas fa-plus"></i>
      </button>
      <button
        className="btn btn-sm btn-warning"
        title="Edit Product"
        onClick={() => handleEdit(product)}
        disabled={loading}
      >
        <i className="fas fa-edit"></i>
      </button>
      <button
        className="btn btn-sm btn-danger"
        title="Delete Product"
        onClick={() => handleDelete(product._id)}
        disabled={loading}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading products...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!products || products.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
              No products found
            </div>
          </td>
        </tr>
      );
    }

    return products.map((product, index) => (
      <tr key={product._id} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          <code className="px-2 py-1 rounded">
            {product.sku.toUpperCase() || "N/A"}
          </code>
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="rounded mr-2"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="d-flex align-items-center">
              <div className="font-weight-medium" title={product.name || ""}>
                <code className="px-2 py-1 rounded">
                  {truncateText(product.name, 60)}
                </code>
              </div>
              <CopyToClipboardButton text={product.name} />
            </div>
          </div>
        </td>
        <td className="text-center align-middle">
          {product.variant ? (
            <span className="badge badge-secondary">{product.variant}</span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td className="text-center align-middle">
          <QuantityBadge quantity={product.quantity} unit={product.unit} />
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(product.price)}
          </span>
        </td>
        <td className="text-center align-middle">
          <StatusBadge status={product.status} />
        </td>
        <td className="text-center align-middle">
          <small className="text-muted">{formatDate(product.createdAt)}</small>
        </td>
        <td className="text-center align-middle">
          {renderActionButtons(product)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-box mr-2"></i>
          Products
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
                <th className="text-center" style={{ width: "200px" }}>
                  SKU
                </th>
                <th>Product Name</th>
                <th className="text-center" style={{ width: "100px" }}>
                  Variant
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  Stock
                </th>
                <th className="text-right" style={{ width: "100px" }}>
                  Price
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  Status
                </th>
                <th className="text-center" style={{ width: "120px" }}>
                  Added
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

export default ProductTable;
