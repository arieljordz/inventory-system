import React from "react";
import { Modal, Button } from "react-bootstrap";
import { SelectInput } from "../../components/common/FormInputs";

const ImportModal = ({
  show,
  onClose,
  form,
  handleChange,
  fileInputRef,
  handleImport,
  platformOptions,
}) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="md">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Import Sales</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SelectInput
          label="Platform"
          name="platform"
          value={form.platform}
          onChange={handleChange}
          options={platformOptions}
          required
        />

        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImport}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="success"
            onClick={() => fileInputRef.current.click()}
          >
            <i className="fas fa-file-import mr-1"></i> Choose File
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={onClose}>
          Close
        </Button> */}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportModal;
