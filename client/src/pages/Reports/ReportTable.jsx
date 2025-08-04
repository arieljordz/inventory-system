import React from "react";

const ReportTable = ({ reportData, reportType }) => {
  console.log("reportData:", reportData);
  console.log("reportType:", reportType);
  if (!reportData || reportData.length === 0) {
    return (
      <div className="text-center text-muted mt-4">
        <i>No report generated yet.</i>
      </div>
    );
  }

  const columns = Object.keys(
    reportData[0].product
      ? {
          Product: "",
          "Movement Type": "",
          Quantity: "",
          Status: "",
          Date: "",
        }
      : {
          Product: "",
          Quantity: "",
          Courier: "",
          Platform: "",
          Paid: "",
          Status: "",
          Date: "",
        }
  );

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, idx) => {
            const row = {
              Product: item.product?.name || "-",
              Quantity: item.quantity,
              Date: new Date(item.createdAt).toLocaleDateString(),
            };

            if (reportType.includes("Inventory")) {
              row["Movement Type"] = item.movementType;
              row["Status"] = item.status || "-";
            } else {
              row["Courier"] = item.courier || "-";
              row["Platform"] = item.platform || "-";
              row["Paid"] = item.isPaid ? "Yes" : "No";
              row["Status"] = item.status || "-";
            }

            return (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
