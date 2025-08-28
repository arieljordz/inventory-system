import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { SelectInput } from "../../components/common/FormInputs";

const ImportModal = ({
  show,
  onClose,
  form,
  handleChange,
  handleImport,
  platformOptions,
  importType,
}) => {
  const fileInputRef = useRef(null);

  const acceptedFileTypes = ".xlsx, .xls, .csv";
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImport(file, form.platform);
      e.target.value = ""; // reset file input
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="md">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          {importType === "returned" ? "Import Returned" : "Import Sales"}
        </Modal.Title>
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
          accept={acceptedFileTypes}
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="success"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-file-import mr-1"></i> Choose File
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImportModal;
