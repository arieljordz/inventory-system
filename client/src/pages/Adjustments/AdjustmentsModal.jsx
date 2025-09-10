import React, { useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { TextInput, SelectInput } from "../../components/FormInputs";

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

  useEffect(() => {
    if (show && valueRef.current) {
      valueRef.current.focus();
    }
  }, [show]);

  if (!selected) return null;

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={onApply}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Price Adjustments</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-3 font-weight-bold">
            {activeTab === "products" ? "Product:" : "Item:"}{" "}
            {selected?.name || ""}
          </p>

          <div className="row">
            {/* Adjustment Form */}
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

              <TextInput
                label="Notes"
                name="notes"
                type="textarea"
                value={adjustment.notes}
                onChange={onChange}
                placeholder="Optional notes"
              />
            </div>

            {/* History Section */}
            <div className="col-md-6">
              <h6>Adjustment History</h6>
              <ul className="list-group">
                {adjustmentHistory.length > 0 ? (
                  adjustmentHistory.map((adj) => (
                    <li key={adj._id} className="list-group-item">
                      <strong>{adj.adjustmentType}</strong>{" "}
                      {adj.valueType === "percentage"
                        ? `${adj.value}%`
                        : `₱${adj.value}`}{" "}
                      → ₱{adj.newPrice}
                      <br />
                      <small>{adj.notes}</small>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item">No adjustments yet</li>
                )}
              </ul>
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
