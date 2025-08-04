import React, { useMemo } from "react";
import { SelectInput } from "../../components/common/FormInputs";
import { ReportTypeEnum } from "../../enums/enums";

const ReportFilter = ({
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  handleGenerateReport,
}) => {
  const reportOptions = useMemo(
    () =>
      Object.entries(ReportTypeEnum).map(([key, value]) => ({
        label: key,
        value: value,
      })),
    []
  );

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
        <label>From</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.startDate}
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              from: e.target.value,
            }))
          }
        />
      </div>

      <div className="col-md-3">
        <label>To</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.endDate}
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              to: e.target.value,
            }))
          }
        />
      </div>

      <div className="col-md-2 pt-4">
        <button
          className="btn btn-success btn-block mt-2"
          onClick={handleGenerateReport}
        >
          Generate
        </button>
      </div>
    </div>
  );
};

export default ReportFilter;
