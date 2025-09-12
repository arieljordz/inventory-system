import React, { useMemo } from "react";
import { formatCellValue } from "../../utils/reportUtils";

const ReportTable = ({ reportData, dataCount, columns, reportType }) => {
  const memoizedTable = useMemo(() => {
    if (!reportData || reportData.length === 0 || !columns) {
      return <p className="text-muted text-center mt-3">No data available</p>;
    }

    // --- Compute totals for columns with "total: true" ---
    const totals = {};
    columns.forEach((col) => {
      if (col.total) {
        totals[col.key] = reportData.reduce(
          (sum, row) => sum + (Number(row[col.key]) || 0),
          0
        );
      }
    });

    return (
      <div className="card mt-3 shadow-sm">
        {reportType && (
          <div className="card-header bg-primary text-white d-flex align-items-center">
            <h5 className="mb-0">{reportType}</h5>

            <span className="badge bg-light text-dark px-3 py-2 rounded-pill shadow-sm ms-auto">
              {dataCount} Records
            </span>
          </div>
        )}

        <div className="card-body p-0">
          <div className="report-table-container">
            <table className="table table-bordered table-hover table-striped mb-0 report-table">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-${col.align || "left"}`}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`text-${col.align || "left"}`}
                      >
                        {formatCellValue(row[col.key], col.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  {columns.map((col, idx) => (
                    <td key={col.key} className={`text-${col.align || "left"}`}>
                      {col.total
                        ? formatCellValue(totals[col.key], col.format)
                        : idx === 0
                        ? "Grand Total"
                        : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }, [reportData, columns, reportType, dataCount]);

  return memoizedTable;
};

export default ReportTable;
