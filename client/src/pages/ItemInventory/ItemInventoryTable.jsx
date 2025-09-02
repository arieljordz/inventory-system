import React, { useState } from "react";
import {
  computeTotalPrice,
  formatAmount,
  formatDate,
  truncateText,
} from "../../utils/commonUtils";
import StatusBadge from "../../components/StatusBadge";
import QuantityBadge from "../../components/QuantityBadge";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

const ItemInventoryTable = ({
  items = [],
  onEdit,
  onDelete,
  onRestock,
  loading = false,
}) => {
  // console.log("Rendering ItemInventoryTable with items:", items);
  const handleEdit = (item) => {
    if (loading) return;
    onEdit?.(item);
  };

  const handleDelete = (itemId) => {
    if (loading) return;
    onDelete?.(itemId);
  };

  const handleRestock = (item) => {
    if (loading) return;
    onRestock?.(item);
  };

  const renderActionButtons = (item) => (
    <div className="btn-group" role="group">
      <button
        className="btn btn-sm btn-info"
        title="Restock Item"
        onClick={() => handleRestock(item)}
        disabled={loading}
      >
        <i className="fas fa-plus"></i>
      </button>
      <button
        className="btn btn-sm btn-warning"
        title="Edit Item"
        onClick={() => handleEdit(item)}
        disabled={loading}
      >
        <i className="fas fa-edit"></i>
      </button>
      <button
        className="btn btn-sm btn-danger"
        title="Delete Item"
        onClick={() => handleDelete(item._id)}
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
          <td colSpan="10" className="text-center py-4">
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <span className="text-muted">Loading items...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!items || items.length === 0) {
      return (
        <tr>
          <td colSpan="10" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
              No items found
            </div>
          </td>
        </tr>
      );
    }

    return items.map((item, index) => (
      <tr key={item._id} className={loading ? "table-secondary" : ""}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          <code className="px-2 py-1 rounded">
            {item.sku.toUpperCase() || "N/A"}
          </code>
        </td>
        <td className="align-middle">
          <div className="d-flex align-items-center">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="rounded mr-2"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="d-flex align-items-center">
              <div className="font-weight-medium" title={item.name || ""}>
                <code className="px-2 py-1 rounded">
                  {truncateText(item.name, 60)}
                </code>
              </div>
              <CopyToClipboardButton text={item.name} />
            </div>
          </div>
        </td>
        <td className="text-center align-middle">
          {item.variant ? (
            <span className="badge badge-secondary">{item.variant}</span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td className="text-center align-middle">
          <QuantityBadge quantity={item.quantity} unit={item.unit} />
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">{formatAmount(item.price)}</span>
        </td>
        <td className="text-right align-middle">
          <span className="font-weight-bold">
            {formatAmount(computeTotalPrice(item.quantity, item.price))}
          </span>
        </td>
        <td className="text-center align-middle">
          <StatusBadge status={item.status} />
        </td>
        <td className="text-center align-middle">
          <small className="text-muted">{formatDate(item.createdAt)}</small>
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
          <i className="fas fa-boxes mr-2"></i>
          Items
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
                <th>Item Name</th>
                <th className="text-center" style={{ width: "100px" }}>
                  Variant
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  Stock
                </th>
                <th className="text-right" style={{ width: "100px" }}>
                  Price
                </th>
                <th className="text-right" style={{ width: "100px" }}>
                  Total Price
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

export default ItemInventoryTable;
