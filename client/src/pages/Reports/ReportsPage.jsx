import React, { useEffect, useState } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import { getReports } from "../../services/reportService";
import Navpath from "../../components/common/Navpath";
import { ReportTypeEnum } from "../../enums/enums";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { getCurrentDate } from "../../utils/commonUtils";
import ReportFilter from "./ReportFilter";
import ReportTable from "./ReportTable";

const ReportsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [reportType, setReportType] = useState(ReportTypeEnum.INVENTORY);
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
      const res = await getReports({
        reportType,
        startDate,
        endDate,
      });

      console.log(res.data);
      if (!res.data || res.data.length === 0) {
        toast.info("No records found for the selected range.");
        setReportData([]);
      } else {
        setReportData(res.data);
        toast.success("Report generated successfully.");
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      toast.error("Error generating report.");
    } finally {
      hideSpinner();
    }
  };

  const formatReportData = () => {
    if (!reportData.length) return [];
    console.log("reportType:", reportType);
    return reportData.map((item) => {
      const base = {
        Product: item.product?.name || "-",
        Quantity: item.quantity,
        Date: new Date(item.createdAt).toLocaleDateString(),
      };

      if (reportType.includes("Inventory")) {
        return {
          ...base,
          "Movement Type": item.movementType,
          Status: item.status || "-",
        };
      } else {
        return {
          ...base,
          Courier: item.courier || "-",
          Platform: item.platform || "-",
          Paid: item.isPaid ? "Yes" : "No",
          Status: item.status || "-",
        };
      }
    });
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
              <ReportFilter
                reportType={reportType}
                setReportType={setReportType}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleGenerateReport={handleGenerateReport}
              />

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
              <ReportTable reportData={reportData} reportType={reportType} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
