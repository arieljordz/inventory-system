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
        label: value,
        value: value,
      })),
    []
  );

  // console.log("filter reportType:", reportType);
  return (
    <div className="row mb-3">
      <div className="col-md-4">
        <SelectInput
          label="Report Type"
          name="reportType"
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
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              startDate: e.target.value,
            }))
          }
        />
      </div>

      <div className="col-md-3">
        <label>End Date</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.endDate}
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              endDate: e.target.value,
            }))
          }
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
