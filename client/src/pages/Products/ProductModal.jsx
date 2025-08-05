import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { UnitTypeEnum } from "../../enums/enums";
import {
  TextInput,
  TextArea,
  SelectInput,
} from "../../components/common/FormInputs";

const ProductModal = ({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  isEditMode,
}) => {
  const [imagePreview, setImagePreview] = useState(null);

  const unitOptions = useMemo(
    () =>
      Object.entries(UnitTypeEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

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
          <TextArea
            label="Product Name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter product name"
            required
          />

          <TextArea
            label="Product Description"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Enter product description"
            required
          />

          <Row>
            <Col md={4}>
              <TextInput
                label="Price"
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="Enter product price"
                required
                type="number"
                max={6}
              />
            </Col>
            <Col md={4}>
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
            <Col md={4}>
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

          <Form.Group controlId="productImage" className="mb-2">
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
            <i className="fas fa-times-circle mr-1"></i> Cancel
          </Button>
          <Button type="submit" variant="primary">
            <i className="fas fa-save mr-2"></i>
            {isEditMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;
