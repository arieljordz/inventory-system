import React, { useEffect, useMemo, useState } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import { getReports } from "../../services/reportService";
import Navpath from "../../components/common/Navpath";
import { ReportTypeEnum } from "../../enums/enums";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  getCurrentDate,
  parseCurrencyToFloat,
  formatAmount,
} from "../../utils/commonUtils";
import {
  formatReportData,
  formatExportData,
  getCenteredColumns,
  getReportFileName,
  getReportTitleText,
} from "../../utils/reportUtils";
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
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  const handleGenerateReport = async () => {
    const { startDate, endDate } = dateRange;

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      showSpinner();
      const res = await getReports({ reportType, startDate, endDate });

      // console.log("res.data:", res.data);
      if (!res.data?.data || res.data?.data.length === 0) {
        toast.info("No records found for the selected range.");
        setReportData([]);
        setIsReportGenerated(false);
      } else {
        setReportData(res.data?.data);
        setActiveReportType(reportType);
        setIsReportGenerated(true);
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

  const formattedExportReport = useMemo(() => {
    return formatExportData(reportData, activeReportType);
  }, [reportData, activeReportType]);

  const handleExport = (format) => {
    if (!formattedExportReport.length) {
      toast.warning("No data available to export.");
      return;
    }

    try {
      const isSalesReport = activeReportType.includes(ReportTypeEnum.SALES);
      const headers = Object.keys(formattedExportReport[0]);
      const centerCols = getCenteredColumns(activeReportType);
      const { startDate, endDate } = dateRange;

      // Prepare body
      const body = formattedExportReport.map((row) => Object.values(row));

      // Compute grand total for sales
      let grandTotal = 0;
      if (isSalesReport) {
        grandTotal = formattedExportReport.reduce(
          (acc, row) => acc + parseCurrencyToFloat(row["Total Amount"]),
          0
        );

        // Append grand total row
        const totalRow = headers.map((header) =>
          header === "Total Amount" ? `${grandTotal}` : ""
        );
        body.push(totalRow);
      }

      const filename = getReportFileName(
        activeReportType,
        startDate,
        endDate,
        format === "pdf" ? "pdf" : "xlsx"
      );

      if (format === "pdf") {
        exportToPDF({
          headers,
          body,
          centerCols,
          startDate,
          endDate,
          activeReportType,
          filename,
        });
      }

      if (format === "excel") {
        exportToExcel({
          headers,
          body,
          filename,
        });
      }
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export report.");
    }
  };

  const exportToPDF = ({
    headers,
    body,
    centerCols,
    startDate,
    endDate,
    activeReportType,
    filename,
  }) => {
    const doc = new jsPDF();

    doc.text(getReportTitleText(activeReportType, startDate, endDate), 14, 15);

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

    doc.save(filename);
    toast.success("PDF report downloaded.");
  };

  const exportToExcel = ({ headers, body, filename }) => {
    const exportData = [headers, ...body];
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, filename);
    toast.success("Excel report downloaded.");
  };

  return (
    <>
      <Navpath
        levelOne="Reports Management"
        levelTwo="Home"
        levelThree="Reports"
      />
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
                setReportType={(value) => {
                  setReportType(value);
                  setIsReportGenerated(false); // hide the table on change
                }}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleGenerateReport={handleGenerateReport}
              />

              {isReportGenerated && (
                <>
                  {/* Export Buttons */}
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

                  {/* Report Table */}
                  <ReportTable
                    formattedReport={formattedReport}
                    activeReportType={activeReportType}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
