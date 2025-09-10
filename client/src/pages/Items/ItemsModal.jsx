// src/pages/ItemInventory/ItemModal.jsx
import React, { useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { UnitTypeEnum } from "../../enums/enums";
import { TextInput, SelectInput } from "../../components/FormInputs";

const ItemModal = ({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  isEditMode,
}) => {
  /** 🔹 Build Unit Options */
  const unitOptions = useMemo(
    () =>
      Object.entries(UnitTypeEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

  /** 🔹 Header style based on mode */
  const headerClass = isEditMode
    ? "bg-warning text-dark"
    : "bg-success text-white";
  const modalTitle = isEditMode ? "Edit Item" : "Add Item";

  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton className={headerClass}>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* 🔹 Item Details */}
          <Row>
            <Col md={6}>
              <TextInput
                label="Item Name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter item name"
                required
              />
            </Col>
            <Col md={6}>
              <SelectInput
                label="Unit"
                name="unit"
                value={form.unit}
                onChange={onChange}
                options={unitOptions}
                required
              />
            </Col>
          </Row>

          {/* 🔹 Price & Quantity */}
          <Row>
            <Col md={4}>
              <TextInput
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                placeholder="Enter item price"
                required
              />
            </Col>
            <Col md={4}>
              <TextInput
                label="Retail Price"
                name="retailPrice"
                type="number"
                value={form.retailPrice}
                onChange={onChange}
                placeholder="Enter item retail price"
                required
              />
            </Col>
            <Col md={4}>
              <TextInput
                label="Quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={onChange}
                placeholder="Enter quantity"
                required
                disabled={isEditMode}
              />
            </Col>
          </Row>

          {/* 🔹 Extra Info */}
          <Row>
            <Col md={6}>
              <TextInput
                label="Variant"
                name="variant"
                value={form.variant}
                onChange={onChange}
                placeholder="Enter variant (optional)"
              />
            </Col>
            <Col md={6}>
              <TextInput
                label="Supplier"
                name="supplier"
                value={form.supplier}
                onChange={onChange}
                placeholder="Enter supplier (optional)"
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times-circle mr-1"></i> Cancel
          </Button>
          <Button type="submit" variant={isEditMode ? "warning" : "success"}>
            <i className="fas fa-save mr-2"></i>
            {isEditMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ItemModal;
