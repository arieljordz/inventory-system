import React from "react";
import { getCenteredColumns } from "../../utils/reportUtils";

const ReportTable = ({ formattedReport, activeReportType }) => {
  if (!formattedReport || formattedReport.length === 0) {
    return (
      <div className="text-center text-muted mt-4">
        <i>No report generated yet.</i>
      </div>
    );
  }

  const columns = Object.keys(formattedReport[0]);
  const centerColumns = getCenteredColumns(activeReportType);

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className={centerColumns.includes(col) ? "text-center" : ""}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formattedReport.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td
                  key={col}
                  className={
                    centerColumns.includes(col)
                      ? "text-center align-middle"
                      : ""
                  }
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
