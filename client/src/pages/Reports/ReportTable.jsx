import React from "react";
import { getCenteredColumns } from "../../utils/reportUtils";
import { ReportTypeEnum, formatAmount, parseCurrencyToFloat } from "../../utils/commonUtils";

const ReportTable = ({ reportData, activeReportType }) => {
  if (!reportData?.length) {
    return <div className="text-center text-muted mt-4"><i>No report generated yet.</i></div>;
  }

  const columns = Object.keys(reportData[0]);
  const centerColumns = getCenteredColumns(activeReportType);
  const isSalesReport = activeReportType.includes(ReportTypeEnum.SALES);
  const grandTotal = isSalesReport
    ? reportData.reduce((acc, row) => acc + parseCurrencyToFloat(row["Total Amount"]), 0)
    : 0;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            {columns.map((col) => (
              <th key={col} className={centerColumns.includes(col) ? "text-center" : col.includes("Amount") || col === "Price" ? "text-end" : ""}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className={centerColumns.includes(col) ? "text-center align-middle" : col.includes("Amount") || col === "Price" ? "text-end align-middle" : ""}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
          {isSalesReport && (
            <tr>
              <td colSpan={columns.length - 2} className="text-end fw-bold">Grand Total:</td>
              <td className="text-end fw-bold">{formatAmount(grandTotal)}</td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
