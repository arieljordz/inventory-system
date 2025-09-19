// src/pages/Users/UsersModal.jsx
import React, { useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { TextInput, SelectInput } from "../../components/FormInputs";
import { UserRoleEnum } from "../../enums/enums";

const UsersModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isEditMode,
}) => {
  const roleOptions = useMemo(
    () =>
      Object.entries(UserRoleEnum).map(([key, value]) => ({
        label: key,
        value: value,
      })),
    []
  );
  /** 🔹 Header style based on mode */
  const headerClass = isEditMode
    ? "bg-warning text-dark"
    : "bg-success text-white";
  const modalTitle = isEditMode ? "Edit User" : "Add User";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" size="lg">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Modal.Header closeButton className={headerClass}>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <Col md={6}>
              <TextInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </Col>
            <Col md={6}>
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                disabled={isEditMode}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextInput
                label="Profile Picture URL"
                name="picture"
                value={form.picture}
                onChange={handleChange}
                placeholder="Enter picture URL"
                disabled={isEditMode}
              />
            </Col>
            <Col md={6}>
              <TextInput
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  isEditMode
                    ? "Enter new password (optional)"
                    : "Enter password"
                }
                required={!isEditMode}
                disabled={isEditMode}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <SelectInput
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={roleOptions}
                required
              />
            </Col>
            <Col md={6} className="d-flex align-items-center mt-3">
              <Form.Check
                type="checkbox"
                id="isVerified"
                name="isVerified"
                checked={form.isVerified}
                onChange={handleChange}
                label="Verified User"
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

export default UsersModal;
