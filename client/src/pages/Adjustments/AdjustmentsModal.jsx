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
  const valueRef = useRef(null);

  // 🔹 Autofocus on value input when modal opens
  useEffect(() => {
    if (show && valueRef.current) {
      valueRef.current.focus();
    }
  }, [show]);

  // 🔹 Compute the new price after applying adjustment
  const computedPrice = useMemo(() => {
    if (!selected?.price) return null;

    const basePrice = selected.price;
    const val = Number(adjustment.value) || 0;

    let newPrice = basePrice;

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

  // 🔹 Validation: disable Apply if no product/item or invalid adjustment
  const isApplyDisabled =
    !selected || !adjustment.value || Number(adjustment.value) === 0;

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={onApply}>
        {/* HEADER */}
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Price Adjustments</Modal.Title>
        </Modal.Header>

        {/* BODY */}
        <Modal.Body>
          {!selected ? (
            <p className="text-muted">No product or item selected.</p>
          ) : (
            <>
              {/* Basic Info */}
              <div className="mb-3">
                <p className="fw-bold mb-1">
                  {activeTab === "products" ? "Product:" : "Item:"}{" "}
                  <span className="text-primary">{selected.name}</span>
                </p>
                <p className="fw-bold mb-0">
                  Variant: <span className="text-secondary">{selected.variant}</span>
                </p>
              </div>

              {/* Adjustment Settings */}
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

              {/* Value + Preview */}
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
                    min="1"
                    inputRef={valueRef}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="w-100 mt-3 p-3 border rounded bg-light">
                    <p className="mb-1">
                      <strong>Current Price:</strong> {formatAmount(selected.price)}
                    </p>
                    <p className="mb-0">
                      <strong>New Price:</strong>{" "}
                      <span
                        className={
                          adjustment.adjustmentType === "discount"
                            ? "text-danger fw-bold"
                            : "text-success fw-bold"
                        }
                      >
                        ₱{computedPrice?.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
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

              {/* History */}
              <div className="row mt-1">
                <div className="col-12">
                  <AdjustmentsHistoryList history={adjustmentHistory} />
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        {/* FOOTER */}
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times-circle me-1"></i> Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isApplyDisabled}>
            <i className="fas fa-check-circle me-1"></i> Apply
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdjustmentsModal;
