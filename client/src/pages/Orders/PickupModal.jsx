import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

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
  min,
  max,
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
      min={min}
      max={max}
    />
  </Form.Group>
);

const PickupModal = ({
  show,
  selectedProduct,
  form,
  setForm,
  getQuantity,
  onClose,
  handleConfirmPickup,
}) => {
  const inputRef = useRef(null);
  const [showOverflowWarning, setShowOverflowWarning] = useState(false);

  const inputQty = Number(form.quantity);
  const availableQty = getQuantity?.() || 0;

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  useEffect(() => {
    setShowOverflowWarning(inputQty > availableQty && inputQty !== 0);
  }, [inputQty, availableQty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirmPickup();
  };

  if (!show || !selectedProduct) return null;

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="md">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Enter Quantity for Pick Up</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-2">
            <strong>{selectedProduct?.name || "N/A"}</strong>
            <br />
            Available Quantity: {availableQty}
          </p>

          <TextInput
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Enter quantity"
            required
            inputRef={inputRef}
            min={1}
            max={availableQty}
          />

          {showOverflowWarning && (
            <small className="text-danger">
              Quantity exceeds available stock.
            </small>
          )}

          <TextInput
            label="Courier"
            name="courier"
            type="text"
            value={form.courier}
            onChange={(e) => setForm({ ...form, courier: e.target.value })}
            placeholder="Enter courier"
            required
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !form.quantity ||
              inputQty <= 0 ||
              inputQty > availableQty ||
              !form.courier.trim()
            }
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PickupModal;
