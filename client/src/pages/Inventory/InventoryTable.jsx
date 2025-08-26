import React from "react";
import { truncateText } from "../../utils/commonUtils";
import { StatusEnum, MovementTypeEnum } from "../../enums/enums";
import CopyToClipboardButton from "../../components/common/CopyToClipboardButton";

const InventoryTable = ({ data = [], loading = false }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getBadgeClass = (type) => {
    switch (type) {
      case MovementTypeEnum.IN:
        return "badge-success";
      case MovementTypeEnum.OUT:
        return "badge-danger";
      case StatusEnum.TO_SHIP:
        return "badge-warning";
      case StatusEnum.SHIPPING:
        return "badge-primary";
      case StatusEnum.RETURNED:
        return "badge-secondary";
      case StatusEnum.DELIVERED:
        return "badge-info";
      case StatusEnum.COMPLETED:
        return "badge-dark";
      default:
        return "badge-light text-dark";
    }
  };

  /** 🔹 Group movements by product */
  const groupedByProduct = data.reduce((acc, movement) => {
    const productId = movement.product?._id || movement.productId;
    if (!acc[productId]) {
      acc[productId] = {
        product: movement.product || {},
        movements: [],
      };
    }
    acc[productId].movements.push(movement);
    return acc;
  }, {});

  /** 🔹 Render rows for each product group */
  const renderTableRows = (movements) => {
    return movements.map((m, idx) => (
      <tr key={m._id || idx}>
        <td className="text-center align-middle">{idx + 1}</td>
        <td className="text-center align-middle">
          <span className={`badge ${getBadgeClass(m.movementType)}`}>
            {m.movementType}
          </span>
        </td>
        <td className="text-center align-middle">{m.quantity}</td>
        <td className="align-middle">{m.remarks || "-"}</td>
        <td className="text-center align-middle">
          {formatDate(m.orderDate ?? m.createdAt)}
        </td>
      </tr>
    ));
  };

  /** 🔹 Render per-product grouped table */
  const renderGroupedTables = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary mr-2" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <span className="text-muted">Loading inventory...</span>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center text-muted py-4">
          <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
          No product movements found
        </div>
      );
    }

    return Object.entries(groupedByProduct).map(
      ([productId, { product, movements }], index) => {
        const productName = product?.name || "-";
        const variant = product?.variant || "Default";
        const remainingQty = product?.quantity ?? 0;

        return (
          <div key={productId} className="mb-3 border rounded">
            {/* ✅ Responsive Product Header */}
            <div className="bg-primary text-white p-2 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              {/* Left side: Product Name + Copy Button + Variant */}
              <div className="d-flex flex-wrap align-items-center">
                <strong className="me-2">
                  {index + 1}. {truncateText(productName, 100)}
                </strong>
                <CopyToClipboardButton
                  text={productName}
                  className="me-2 text-white"
                />
                <span className="badge badge-light text-dark mb-1 mb-md-0">
                  ({variant})
                </span>
              </div>

              {/* Right side: Remaining Quantity */}
              <span className="badge badge-light text-dark">
                Remaining Qty: {remainingQty}
              </span>
            </div>

            {/* Child Table */}
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0">
                <thead className="thead-light">
                  <tr>
                    <th className="text-center" style={{ width: "50px" }}>
                      #
                    </th>
                    <th className="text-center" style={{ width: "100px" }}>
                      Type
                    </th>
                    <th className="text-center" style={{ width: "100px" }}>
                      Quantity
                    </th>
                    <th>Remarks</th>
                    <th className="text-center" style={{ width: "160px" }}>
                      Transaction Date
                    </th>
                  </tr>
                </thead>
                <tbody>{renderTableRows(movements)}</tbody>
              </table>
            </div>
          </div>
        );
      }
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="fas fa-exchange-alt mr-2"></i>
          Product Movements
        </h3>
      </div>
      <div className="card-body p-0">{renderGroupedTables()}</div>
    </div>
  );
};

export default InventoryTable;
