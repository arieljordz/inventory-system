import React, { useState } from "react";
import { getReports } from "../../services/reportService";
import Navpath from "../../components/common/Navpath";
import { ReportTypeEnum } from "../../enums/enums";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const ReportsPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  });
  const [reportType, setReportType] = useState(ReportTypeEnum.INVENTORY);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState([]);

  const handleGenerateReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select both From and To dates.");
      return;
    }

    try {
      setIsGenerating(true);
      const res = await getReports({
        reportType,
        from: dateRange.from,
        to: dateRange.to,
      });

      if (!res.data || res.data.length === 0) {
        toast.info("No records found for the selected range.");
      } else {
        setReportData(res.data);
        toast.success("Report generated successfully.");
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      toast.error("Error generating report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatReportData = () => {
    return reportData.map((item) => ({
      Product: item.product?.name || "-",
      "Movement Type": item.movementType,
      Quantity: item.quantity,
      Status: item.status,
      Date: new Date(item.createdAt).toLocaleDateString(),
    }));
  };

  const handleExport = (format) => {
    if (reportData.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const data = formatReportData();

    try {
      if (format === "pdf") {
        const doc = new jsPDF();
        doc.text(`Report: ${reportType.toUpperCase()}`, 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [Object.keys(data[0])],
          body: data.map((row) => Object.values(row)),
        });
        doc.save(`report-${reportType}-${Date.now()}.pdf`);
        toast.success("PDF report downloaded.");
      }

      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `report-${reportType}-${Date.now()}.xlsx`);
        toast.success("Excel report downloaded.");
      }
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export report.");
    }
  };

  return (
    <>
      <Navpath levelOne="Reports" levelTwo="Home" levelThree="Reports" />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Generate Report</h3>
            </div>
            <div className="card-body">
              {/* Filter Inputs */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label>Report Type</label>
                  <select
                    className="form-control"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value={ReportTypeEnum.INVENTORY}>Inventory</option>
                    <option value={ReportTypeEnum.SALES}>Sales</option>
                    <option value={ReportTypeEnum.PICKUPS}>Pick Ups</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label>From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.from}
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
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-success btn-block"
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>

              {/* Export Buttons */}
              {reportData.length > 0 && (
                <div className="mb-3 d-flex justify-content-end">
                  <button
                    className="btn btn-outline-primary mr-2"
                    onClick={() => handleExport("excel")}
                  >
                    Export to Excel
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleExport("pdf")}
                  >
                    Export to PDF
                  </button>
                </div>
              )}

              {/* Report Table */}
              {reportData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Movement Type</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name || "-"}</td>
                          <td>{item.movementType}</td>
                          <td>{item.quantity}</td>
                          <td>{item.status}</td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !isGenerating && (
                  <div className="text-center text-muted mt-4">
                    <i>No report generated yet.</i>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
