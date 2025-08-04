import React from "react";
import { StatusEnum, MovementTypeEnum } from "../../enums/enums";

const InventoryTable = ({ data = [] }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getBadgeClass = (type) => {
    switch (type) {
      case MovementTypeEnum.IN:
        return "bg-success";
      case MovementTypeEnum.OUT:
        return "bg-danger";
      case StatusEnum.TO_SHIP:
        return "bg-warning";
      case StatusEnum.SHIPPING:
        return "bg-primary";
      case StatusEnum.RETURNED:
        return "bg-secondary";
      case StatusEnum.DELIVERED:
        return "bg-info";
      case StatusEnum.COMPLETED:
        return "bg-dark";
      default:
        return "bg-light text-dark";
    }
  };

  // Group movements by product
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

  return (
    <div className="row">
      <div className="col-12">
        <div className="card card-outline card-primary">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-exchange-alt mr-2"></i>
              Product Movements (Grouped by Product)
            </h3>
          </div>

          <div className="card-body p-0">
            {Object.entries(groupedByProduct).length === 0 ? (
              <div className="text-center text-muted py-4">
                No product movements found.
              </div>
            ) : (
              Object.entries(groupedByProduct).map(
                ([productId, { product, movements }], i) => {
                  const productName = product?.name || "-";
                  const remainingQty = product?.quantity ?? 0;

                  return (
                    <div key={productId} className="border-bottom">
                      {/* Parent Header */}
                      <div className="bg-primary text-white p-2 d-flex justify-content-between align-items-center">
                        <strong>
                          {i + 1}. {productName}
                        </strong>
                        <span className="badge bg-light text-dark">
                          Remaining Qty: {remainingQty}
                        </span>
                      </div>

                      {/* Child Table */}
                      <div className="table-responsive">
                        <table className="table table-bordered table-sm mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th
                                className="text-center"
                                style={{ width: "50px" }}
                              >
                                #
                              </th>
                              <th className="text-center">Type</th>
                              <th className="text-center">Quantity</th>
                              <th>Remarks</th>
                              <th className="text-center">Transaction Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {movements.map((m, idx) => (
                              <tr key={m._id}>
                                <td className="text-center">{idx + 1}</td>
                                <td className="text-center">
                                  <span
                                    className={`badge ${getBadgeClass(
                                      m.movementType
                                    )}`}
                                  >
                                    {m.movementType}
                                  </span>
                                </td>
                                <td className="text-center">{m.quantity}</td>
                                <td>{m.remarks || "-"}</td>
                                <td className="text-center">
                                  {formatDate(m.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
