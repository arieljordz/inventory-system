import React, { useMemo } from "react";
import { TextInput, SelectInput } from "../../components/FormInputs";
import {
  NewReportTypeEnum,
  PaymentStatusEnum,
  MovementTypeEnum,
  PlatformEnum,
  StatusEnum,
} from "../../enums/enums";

const ReportFilters = ({
  reportType,
  setReportType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filters,
  handleFilterChange,
  onGenerate,
  loading,
}) => {
  const reportOptions = useMemo(
    () =>
      Object.values(NewReportTypeEnum).map((value) => ({
        label: value,
        value,
      })),
    []
  );
  const paymentStatusOptions = useMemo(
    () =>
      Object.values(PaymentStatusEnum).map((value) => ({
        label: value,
        value,
      })),
    []
  );
  const movementOptions = useMemo(
    () =>
      Object.values(MovementTypeEnum).map((value) => ({ label: value, value })),
    []
  );
  const platformOptions = useMemo(
    () => Object.values(PlatformEnum).map((value) => ({ label: value, value })),
    []
  );
  const statusOptions = useMemo(
    () => Object.values(StatusEnum).map((value) => ({ label: value, value })),
    []
  );

  return (
    <>
      {/* Top Row: Report Type + Date Range */}
      <div className="row g-3">
        <div className="col-md-2">
          <SelectInput
            label="Report Type"
            value={reportType || ""}
            onChange={(e) => setReportType(e.target.value)}
            options={reportOptions}
            required
          />
        </div>

        <div className="col-md-2">
          <TextInput
            label="Start Date"
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-2">
          <TextInput
            label="End Date"
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Optional Filters + Generate */}
      <div className="row g-3 mt-1">
        <div className="col-md-2">
          <SelectInput
            label="Platform"
            name="platform"
            value={filters.platform || ""}
            onChange={handleFilterChange}
            options={[
              { label: "All", value: "" },
              ...platformOptions.map((p) => ({
                label: p.label,
                value: p.value.toLowerCase(),
              })),
            ]}
          />
        </div>

        <div className="col-md-2">
          <SelectInput
            label="Payment Status"
            name="paymentStatus"
            value={filters.paymentStatus || ""}
            onChange={handleFilterChange}
            options={[
              { label: "All", value: "" },
              ...paymentStatusOptions.map((p) => ({
                label: p.label,
                value: p.value.toLowerCase(),
              })),
            ]}
          />
        </div>

        <div className="col-md-2">
          <SelectInput
            label="Movement Type"
            name="movementType"
            value={filters.movementType || ""}
            onChange={handleFilterChange}
            options={[
              { label: "All", value: "" },
              ...movementOptions.map((p) => ({
                label: p.label,
                value: p.value.toLowerCase(),
              })),
            ]}
          />
        </div>

        <div className="col-md-2">
          <SelectInput
            label="Status"
            name="status"
            value={filters.status || ""}
            onChange={handleFilterChange}
            options={[
              { label: "All", value: "" },
              ...statusOptions.map((p) => ({
                label: p.label,
                value: p.value.toLowerCase(),
              })),
            ]}
          />
        </div>

        <div className="col-md-2 pt-4">
          <button
            className="btn btn-success btn-block mt-2"
            onClick={onGenerate}
            disabled={loading}
          >
            <i className="fas fa-sync-alt mr-1"></i>{" "}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportFilters;
