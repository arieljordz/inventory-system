import React, { useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { UnitTypeEnum, StatusEnum } from "../../enums/enums";
import { TextInput, TextArea, SelectInput } from "../../components/FormInputs";
import BundleSelector from "./BundleSelector";

const ProductModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onChange,
  onSubmit,
  isEditMode,
}) => {
  const unitOptions = useMemo(
    () =>
      Object.entries(UnitTypeEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

  const headerClass = isEditMode
    ? "bg-warning text-dark"
    : "bg-success text-white";
  const modalTitle = isEditMode ? "Edit Product" : "Add Product";

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form with components:", form.components);
    onSubmit();
  };

  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" size="lg">
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Modal.Header closeButton className={headerClass}>
          <Modal.Title>{modalTitle}</Modal.Title>
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
              <SelectInput
                label="Status"
                name="status"
                value={form.status}
                onChange={onChange}
                options={Object.entries(StatusEnum).map(([key, value]) => ({
                  label: value,
                  value: key,
                }))}
              />
            </Col>
          </Row>

          {/* Bundle Selector → directly syncs form.components */}
          <BundleSelector
            isEditMode={isEditMode}
            components={form.components}
            setComponents={(comps) =>
              setForm((prev) => ({ ...prev, components: comps }))
            }
          />
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

export default ProductModal;
