import React from "react";
import { Form } from "react-bootstrap";

// Text input component
export const TextInput = ({
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

// Text Area component
export const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
}) => (
  <Form.Group controlId={name} className="mb-2">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      as="textarea"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
    />
  </Form.Group>
);

// Select input component
export const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  disabled = false,
}) => (
  <Form.Group controlId={name} className="mb-2">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      as="select"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    >
      {/* <option value="">{placeholder}</option> */}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Control>
  </Form.Group>
);

export const InfoBox = ({ icon, label, value, color }) => (
  <div className="col-md-3 col-sm-6 col-12">
    <div className={`info-box bg-${color}`}>
      <span className="info-box-icon">
        <i className={`fas ${icon}`}></i>
      </span>
      <div className="info-box-content">
        <span className="info-box-text">{label}</span>
        <span className="info-box-number">{value}</span>
      </div>
    </div>
  </div>
);
