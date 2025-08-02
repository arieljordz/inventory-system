import React, { useEffect, useRef, useState } from "react";
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
  min,
  max,
}) => (
  <Form.Group controlId={name}>
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

const AddQuantityModal = ({
  show,
  selectedProduct,
  pickupQuantity,
  setPickupQuantity,
  getQuantity,
  handleConfirmPickup,
  onClose,
}) => {
  const inputRef = useRef(null);
  const [showOverflowWarning, setShowOverflowWarning] = useState(false);

  const availableQty = selectedProduct ? getQuantity(selectedProduct) : 0;
  const inputQty = Number(pickupQuantity);

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
            <strong>{selectedProduct?.product?.name || "N/A"}</strong>
            <br />
            Available Quantity: {availableQty}
          </p>

          <TextInput
            label="Quantity"
            name="pickupQuantity"
            type="number"
            value={pickupQuantity}
            onChange={(e) => setPickupQuantity(e.target.value)}
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
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!pickupQuantity || inputQty <= 0 || inputQty > availableQty}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddQuantityModal;
