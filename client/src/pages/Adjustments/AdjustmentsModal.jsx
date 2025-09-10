import React, { useEffect, useRef, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { TextInput, TextArea, SelectInput } from "../../components/FormInputs";
import AdjustmentsHistoryList from "./AdjustmentsHistoryList";
import { formatAmount } from "../../utils/commonUtils";

const AdjustmentsModal = ({
  show,
  onClose,
  selected,
  adjustment,
  onChange,
  onApply,
  adjustmentHistory,
  activeTab,
}) => {
  // 🔹 Prevent hooks from running if no selection
  if (!selected) return null;

  const valueRef = useRef(null);

  useEffect(() => {
    if (show && valueRef.current) {
      valueRef.current.focus();
    }
  }, [show]);

  const computedPrice = useMemo(() => {
    if (!selected?.price) return null;

    const basePrice = selected.price;
    let newPrice = basePrice;
    const val = Number(adjustment.value) || 0;

    if (adjustment.adjustmentType === "markup") {
      newPrice =
        adjustment.valueType === "percentage"
          ? basePrice + (basePrice * val) / 100
          : basePrice + val;
    } else if (adjustment.adjustmentType === "discount") {
      newPrice =
        adjustment.valueType === "percentage"
          ? basePrice - (basePrice * val) / 100
          : basePrice - val;
    }

    return newPrice < 0 ? 0 : newPrice;
  }, [selected?.price, adjustment]);

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={onApply}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Price Adjustments</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-3 font-weight-bold">
            {activeTab === "products" ? "Product:" : "Item:"} {selected?.name}
          </p>

          <div className="row">
            <div className="col-md-6">
              <SelectInput
                label="Adjustment Type"
                name="adjustmentType"
                value={adjustment.adjustmentType}
                onChange={onChange}
                options={[
                  { value: "markup", label: "Markup" },
                  { value: "discount", label: "Discount" },
                ]}
              />
            </div>
            <div className="col-md-6">
              <SelectInput
                label="Value Type"
                name="valueType"
                value={adjustment.valueType}
                onChange={onChange}
                options={[
                  { value: "percentage", label: "Percentage (%)" },
                  { value: "fixed", label: "Fixed Amount" },
                ]}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <TextInput
                label="Value"
                name="value"
                type="number"
                value={adjustment.value}
                onChange={onChange}
                placeholder="Enter adjustment value"
                required
                inputRef={valueRef}
              />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="w-100 mt-3 p-2 border rounded bg-light">
                <strong>Current Price:</strong> {formatAmount(selected.price)}
                <br />
                <strong>New Price:</strong>{" "}
                <span
                  className={
                    adjustment.adjustmentType === "discount"
                      ? "text-danger"
                      : "text-success"
                  }
                >
                  ₱{computedPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <TextArea
                label="Notes"
                name="notes"
                value={adjustment.notes}
                onChange={onChange}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <AdjustmentsHistoryList history={adjustmentHistory} />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times-circle me-1"></i> Cancel
          </Button>
          <Button type="submit" variant="success">
            <i className="fas fa-check-circle me-1"></i> Apply
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdjustmentsModal;
