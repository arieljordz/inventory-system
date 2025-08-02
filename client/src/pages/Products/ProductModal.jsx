import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

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
    />
  </Form.Group>
);

const ProductModal = ({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  isEditMode,
}) => {
  const [imagePreview, setImagePreview] = useState(null);

  console.log("form:", form);
  useEffect(() => {
    if (form.image && typeof form.image === "object") {
      setImagePreview(URL.createObjectURL(form.image));
    } else if (typeof form.image === "string") {
      setImagePreview(form.image);
    } else {
      setImagePreview(null);
    }
  }, [form.image]);

  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {isEditMode ? "Edit Product" : "Add Product"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <Col md={6}>
              <TextInput
                label="Serial Number"
                name="serialNumber"
                value={form.serialNumber}
                onChange={onChange}
                placeholder="Enter serial number"
                required
              />
            </Col>
            <Col md={6}>
              <TextInput
                label="Name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter product name"
                required
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextInput
                label="Price"
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="Enter product price"
                required
                type="number"
              />
            </Col>
            <Col md={6}>
              <TextInput
                label="Quantity"
                name="quantity"
                value={form.quantity}
                onChange={onChange}
                placeholder="Enter quantity"
                required
                type="number"
                disabled={isEditMode}
              />
            </Col>
          </Row>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Enter product description"
              rows={2}
            />
          </Form.Group>

          <Form.Group controlId="productImage">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={onChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="text-center mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "200px", maxHeight: "150px" }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;
