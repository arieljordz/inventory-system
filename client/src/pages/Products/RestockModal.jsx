import React, { useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Reusable input component
const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  disabled = false,
  inputRef = null,
}) => (
  <Form.Group controlId={name} className="mb-2">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      ref={inputRef}
      min={type === "number" ? 1 : undefined}
    />
  </Form.Group>
);

const RestockModal = ({ show, onClose, restockForm, onChange, onSubmit }) => {
  const quantityRef = useRef(null);

  useEffect(() => {
    if (show && quantityRef.current) {
      quantityRef.current.focus();
    }
  }, [show]);

  if (!restockForm) return null;

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="md">
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Restock Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-3 font-weight-bold">{restockForm.name}</p>

          <TextInput
            label="Quantity"
            name="quantity"
            value={restockForm.quantity}
            onChange={onChange}
            placeholder="Enter quantity to add"
            required
            type="number"
            inputRef={quantityRef}
          />

          <TextInput
            label="Remarks"
            name="remarks"
            value={restockForm.remarks}
            onChange={onChange}
            placeholder="Optional remarks (e.g., Restocking)"
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="info">
            Restock
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RestockModal;
