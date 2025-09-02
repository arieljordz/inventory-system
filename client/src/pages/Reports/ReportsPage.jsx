import React, { useState } from "react";
import { toast } from "react-toastify";
import Navpath from "../../components/Navpath";
import { useSpinner } from "../../context/SpinnerContext";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { useReportData } from "../../hooks/useReportData";
import ReportFilters from "./ReportFilters";
import { useReportFilters } from "../../hooks/useReportFilters";
import { NewReportTypeEnum } from "../../enums/enums";
import ReportTable from "./ReportTable";

const ReportsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [activeColumns, setActiveColumns] = useState([]);

  const {
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filters,
    setFilters,
    handleFilterChange,
    handleResetFilters,
    columns,
  } = useReportFilters(NewReportTypeEnum.ORDERS_REPORT);

  const { reportData, dataCount, loading, fetchReportData } =
    useReportData(reportType);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.info("Date range is required");
      return;
    }
    try {
      showSpinner();
      await fetchReportData({
        reportType,
        startDate,
        endDate,
        filters,
      });
      setActiveColumns(columns);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch report data");
    } finally {
      hideSpinner();
    }
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
              <ReportFilters
                reportType={reportType}
                setReportType={setReportType}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                filters={filters}
                handleFilterChange={handleFilterChange}
                onGenerate={handleGenerateReport}
                onResetFilters={handleResetFilters}
                loading={loading}
              />

              <div className="mt-4">
                {reportData &&
                reportData.length > 0 &&
                activeColumns.length > 0 ? (
                  <>
                    <div className="d-flex gap-2 mb-2">
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          exportToExcel(
                            reportData,
                            columns,
                            reportType,
                            startDate,
                            endDate
                          )
                        }
                      >
                        <i className="fas fa-file-excel mr-1"></i> Export Excel
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          exportToPDF(
                            reportData,
                            columns,
                            reportType,
                            startDate,
                            endDate
                          )
                        }
                      >
                        <i className="fas fa-file-pdf mr-1"></i> Export PDF
                      </button>
                    </div>

                    <ReportTable
                      reportData={reportData}
                      dataCount={dataCount}
                      columns={activeColumns}
                      reportType={reportType}
                    />
                  </>
                ) : (
                  <p>
                    {loading
                      ? "Loading report..."
                      : "No report data to display"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
