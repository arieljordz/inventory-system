import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import Navpath from "../../components/Navpath";
import ReportFilter from "./ReportFilter";
import ReportTable from "./ReportTable";
import { useSpinner } from "../../context/SpinnerContext";
import { ReportTypeEnum } from "../../enums/enums";
import { getCurrentDate, parseCurrencyToFloat } from "../../utils/commonUtils";
import {
  formatReportData,
  formatExportData,
  getReportFileName,
} from "../../utils/reportUtils";
import { getReports, exportReport } from "../../services/reportService";

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

  /** Fetch report from backend */
  const handleGenerateReport = async () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return toast.error("Select start and end dates.");

    try {
      showSpinner();
      const res = await getReports({ reportType, startDate, endDate });
      const data = res.data?.data || [];

      if (!data.length) {
        // toast.info("No records found.");
        setReportData([]);
        setIsReportGenerated(false);
      } else {
        setReportData(data);
        setActiveReportType(reportType);
        setIsReportGenerated(true);
        // toast.success("Report generated successfully.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating report.");
    } finally {
      hideSpinner();
    }
  };

  /** Export report (Excel or PDF) */
  const handleExport = async (format) => {
    if (!reportData.length) return toast.warning("No data to export.");

    try {
      showSpinner();
      const payload = {
        reportType: activeReportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
      };

      const res = await exportReport(payload);

      // Create Blob and download file
      const filename = getReportFileName(
        activeReportType,
        dateRange.startDate,
        dateRange.endDate,
        format
      );
      const blobType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([res.data], { type: blobType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success(`${format.toUpperCase()} report downloaded.`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed.");
    } finally {
      hideSpinner();
    }
  };

  /** Formatted data for table display */
  const formattedReport = useMemo(
    () => formatReportData(reportData, activeReportType),
    [reportData, activeReportType]
  );

  /** Formatted data for export (optional if needed) */
  const formattedExportReport = useMemo(
    () => formatExportData(reportData, activeReportType),
    [reportData, activeReportType]
  );

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
              <ReportFilter
                reportType={reportType}
                setReportType={(value) => {
                  setReportType(value);
                  setIsReportGenerated(false);
                }}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleGenerateReport={handleGenerateReport}
              />

              {isReportGenerated && (
                <>
                  <div className="mb-3 d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleExport("xlsx")}
                    >
                      <i className="fas fa-file-excel mr-1"></i> Export Excel
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleExport("pdf")}
                    >
                      <i className="fas fa-file-pdf mr-1"></i> Export PDF
                    </button>
                  </div>

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
