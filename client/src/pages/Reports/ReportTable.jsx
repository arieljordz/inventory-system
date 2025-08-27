import React from "react";
import { getCenteredColumns } from "../../utils/reportUtils";
import { ReportTypeEnum } from "../../enums/enums";
import { formatAmount } from "../../utils/commonUtils";

const ReportTable = ({ formattedReport, activeReportType }) => {
  if (!formattedReport?.length)
    return (
      <div className="text-center text-muted mt-4">
        <i>No report generated yet.</i>
      </div>
    );

  const columns = Object.keys(formattedReport[0]);
  const centerColumns = getCenteredColumns(activeReportType);
  const isSalesReport = activeReportType.includes(ReportTypeEnum.SALES);
  const grandTotal = isSalesReport
    ? formattedReport.reduce((sum, row) => {
        const raw = row["Total Amount"] || "0";
        const numeric = parseFloat(raw.replace(/[^\d.-]/g, "")); // remove ₱ and commas
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0)
    : 0;

  // console.log("formattedReport", formattedReport);
  // console.log("isSalesReport", isSalesReport);
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
          {isSalesReport && (
            <tr>
              <td colSpan={columns.length - 2} className="text-end fw-bold">
                Grand Total:
              </td>
              <td className="text-end fw-bold">{formatAmount(grandTotal)}</td>
              <td colSpan={1}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
