import React, { useMemo } from "react";
import { SelectInput } from "../../components/common/FormInputs";
import { ReportTypeEnum } from "../../enums/enums";

const ReportFilter = ({ reportType, setReportType, dateRange, setDateRange, handleGenerateReport }) => {
  const reportOptions = useMemo(
    () => Object.values(ReportTypeEnum).map((value) => ({ label: value, value })),
    []
  );

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="row mb-3">
      <div className="col-md-4">
        <SelectInput
          label="Report Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          options={reportOptions}
          required
        />
      </div>

      <div className="col-md-3">
        <label>Start Date</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.startDate}
          onChange={(e) => handleDateChange("startDate", e.target.value)}
        />
      </div>

      <div className="col-md-3">
        <label>End Date</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.endDate}
          onChange={(e) => handleDateChange("endDate", e.target.value)}
        />
      </div>

      <div className="col-md-2 pt-4">
        <button
          className="btn btn-success btn-block mt-2"
          onClick={handleGenerateReport}
        >
          <i className="fas fa-sync-alt mr-1"></i> Generate
        </button>
      </div>
    </div>
  );
};

export default ReportFilter;
