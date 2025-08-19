import React from "react";
import { getCenteredColumns } from "../../utils/reportUtils";
import { formatAmount, parseCurrencyToFloat } from "../../utils/commonUtils";
import { ReportTypeEnum } from "../../enums/enums";

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
  const isSalesReport = activeReportType.includes(ReportTypeEnum.SALES);

  console.log("columns:", columns);
  console.log("centerColumns:", centerColumns);
  // Compute Grand Total if report is sales
  const grandTotal = isSalesReport
    ? formattedReport.reduce(
        (acc, row) => acc + parseCurrencyToFloat(row["Total Amount"]),
        0
      )
    : 0;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className={
                  centerColumns.includes(col)
                    ? "text-center"
                    : col.includes("Amount") || col === "Price"
                    ? "text-end"
                    : ""
                }
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
                      : col.includes("Amount") || col === "Price"
                      ? "text-end align-middle"
                      : ""
                  }
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}

          {/* Grand total row */}
          {isSalesReport && (
            <tr>
              <td colSpan={columns.length - 2} className="text-end fw-bold">
                Grand Total:
              </td>
              <td className="text-end fw-bold">{formatAmount(grandTotal)}</td>
              <td className="text-end fw-bold"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
