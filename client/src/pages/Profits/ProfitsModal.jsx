import React, { useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { formatAmount, formatDateString } from "../../utils/commonUtils";

const ProfitsModal = ({ show, onClose, selected, activeTab }) => {
  const valueRef = useRef(null);

  useEffect(() => {
    if (show && valueRef.current) {
      valueRef.current.focus();
    }
  }, [show]);

  if (!selected) {
    return (
      <Modal show={show} onHide={onClose} backdrop="static" size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>No Transaction Selected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">No transaction selected.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Form>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            {activeTab === "platform-orders"
              ? "Platform Order Details"
              : "Walk-In Order Details"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Order Info */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2">Order Information</h5>
            <p className="mb-1">
              <strong>Order ID:</strong>{" "}
              {selected.platformOrderId?.toUpperCase() ||
                selected._id?.toUpperCase()}
            </p>
            <p className="mb-1">
              <strong>Platform:</strong>{" "}
              {selected.platform?.toUpperCase() || "Walk-In"}
            </p>
            <p className="mb-1">
              <strong>Status:</strong> {selected.status || "Completed"}
            </p>
            <p className="mb-1">
              <strong>Date:</strong>{" "}
              {formatDateString(selected.orderDate ?? selected.createdAt)}
            </p>
          </div>

          {/* ✅ Platform Orders → show Products + Items */}
          {activeTab === "platform-orders" && (
            <>
              {/* Products */}
              <h5 className="border-bottom pb-2">Products</h5>
              <table className="table table-bordered align-middle">
                <thead className="table-success">
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">Variant</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Cost</th>
                    <th className="text-end">Revenue</th>
                    <th className="text-end">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.products?.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td className="text-center">{p.variant}</td>
                      <td className="text-center">{p.quantity}</td>
                      <td className="text-end text-danger fw-bold">
                        {formatAmount(p.cost)}
                      </td>
                      <td className="text-end fw-bold">
                        {formatAmount(p.price)}
                      </td>
                      <td className="text-end text-success fw-bold">
                        {formatAmount(p.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ✅ Items (for both Walk-in and Platform if available) */}
          {selected.items?.length > 0 && (
            <>
              <h5 className="border-bottom pb-2 mt-4">Items</h5>
              <table className="table table-sm table-bordered align-middle">
                <thead
                  className={
                    activeTab === "platform-orders"
                      ? "table-secondary"
                      : "table-primary"
                  }
                >
                  <tr>
                    <th>Item Name</th>
                    <th className="text-center">Variant</th>
                    <th className="text-center">
                      {activeTab === "platform-orders"
                        ? "Qty in Product"
                        : "Quantity"}
                    </th>
                    <th className="text-end">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items?.flat()?.map((item, j) => (
                    <tr key={j}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.variant}</td>
                      <td className="text-center">
                        {activeTab === "platform-orders"
                          ? item.qtyInProduct
                          : item.quantity}
                      </td>
                      <td className="text-end text-danger fw-bold">
                        {activeTab === "platform-orders"
                          ? formatAmount(item.cost)
                          : formatAmount(item.retailPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Footer Total */}
          <div className="text-end mt-4">
            <h5>
              Total Profit:{" "}
              <span
                className={
                  selected.totalOrderProfit >= 0
                    ? "text-success fw-bold"
                    : "text-danger fw-bold"
                }
              >
                {activeTab === "platform-orders"
                  ? formatAmount(selected.totalOrderProfit)
                  : formatAmount(selected.totalTransactionProfit)}
              </span>
            </h5>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times-circle me-1"></i> Close
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProfitsModal;
