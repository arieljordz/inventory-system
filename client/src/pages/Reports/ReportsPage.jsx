import React, { useEffect, useMemo, useState } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import { getReports } from "../../services/reportService";
import Navpath from "../../components/common/Navpath";
import { ReportTypeEnum } from "../../enums/enums";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { getCurrentDate } from "../../utils/commonUtils";
import { formatReportData, getCenteredColumns } from "../../utils/reportUtils";
import ReportFilter from "./ReportFilter";
import ReportTable from "./ReportTable";

const ReportsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [reportType, setReportType] = useState(ReportTypeEnum.INVENTORY);
  const [activeReportType, setActiveReportType] = useState(
    ReportTypeEnum.INVENTORY
  );
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
  });

  const handleGenerateReport = async () => {
    const { startDate, endDate } = dateRange;

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      showSpinner();
      const res = await getReports({ reportType, startDate, endDate });

      if (!res.data || res.data.length === 0) {
        toast.info("No records found for the selected range.");
        setReportData([]);
      } else {
        setReportData(res.data);
        setActiveReportType(reportType); // ✅ apply current filter
        toast.success("Report generated successfully.");
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      toast.error("Error generating report.");
    } finally {
      hideSpinner();
    }
  };

  const formattedReport = useMemo(() => {
    return formatReportData(reportData, activeReportType);
  }, [reportData, activeReportType]);

  const handleExport = (format) => {
    if (!formattedReport.length) {
      toast.warning("No data available to export.");
      return;
    }

    try {
      const headers = Object.keys(formattedReport[0]);
      const body = formattedReport.map((row) => Object.values(row));
      const centerCols = getCenteredColumns(activeReportType); // ✅ use activeReportType

      if (format === "pdf") {
        const doc = new jsPDF();
        doc.text(`Report: ${activeReportType.toUpperCase()}`, 14, 15); // ✅ use activeReportType

        const columnStyles = {};
        headers.forEach((col, idx) => {
          if (centerCols.includes(col)) {
            columnStyles[idx] = { halign: "center" };
          }
        });

        autoTable(doc, {
          startY: 20,
          head: [headers],
          body,
          columnStyles,
        });

        doc.save(`report-${activeReportType}-${Date.now()}.pdf`); // ✅ use activeReportType
        toast.success("PDF report downloaded.");
      }

      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(formattedReport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(
          workbook,
          `report-${activeReportType}-${Date.now()}.xlsx`
        ); // ✅ use activeReportType
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
              <ReportFilter
                reportType={reportType}
                setReportType={setReportType}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleGenerateReport={handleGenerateReport}
              />

              {/* Export Buttons */}
              {formattedReport.length > 0 && (
                <div className="mb-3 d-flex justify-content-end">
                  <button
                    className="btn btn-outline-primary mr-2"
                    onClick={() => handleExport("excel")}
                  >
                    <i className="fas fa-file-excel mr-1"></i> Export to Excel
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleExport("pdf")}
                  >
                    <i className="fas fa-file-pdf mr-1"></i> Export to PDF
                  </button>
                </div>
              )}

              {/* Report Table */}
              <ReportTable
                formattedReport={formattedReport}
                activeReportType={activeReportType}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
