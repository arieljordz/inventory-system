import React, { useEffect, useRef, useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { PlatformEnum, CourierEnum } from "../../enums/enums";
import { TextInput, SelectInput } from "../../components/common/FormInputs";

const PickupModal = ({
  show,
  selectedProduct,
  form,
  getQuantity,
  onClose,
  onChange,
  handleConfirmPickup,
}) => {
  const inputRef = useRef(null);
  const [showOverflowWarning, setShowOverflowWarning] = useState(false);

  const platformOptions = useMemo(
    () =>
      Object.entries(PlatformEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

  const courierOptions = useMemo(
    () =>
      Object.entries(CourierEnum).map(([key, value]) => ({
        label: value,
        value: value,
      })),
    []
  );

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
            onChange={onChange}
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

          <SelectInput
            label="Platform"
            name="platform"
            value={form.platform}
            onChange={onChange}
            options={platformOptions}
            required
          />

          <TextInput
            label="Platform OrderId"
            name="platformOrderId"
            type="text"
            value={form.platformOrderId}
            onChange={onChange}
            placeholder="Enter orderId"
            required
          />

          <SelectInput
            label="Courier"
            name="courier"
            value={form.courier}
            onChange={onChange}
            options={courierOptions}
            required
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times-circle mr-1"></i> Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !form.quantity ||
              inputQty <= 0 ||
              inputQty > availableQty ||
              !form.platform.trim() ||
              !form.platformOrderId.trim() ||
              !form.courier.trim()
            }
          >
            <i className="fas fa-check-circle mr-1"></i> Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PickupModal;
