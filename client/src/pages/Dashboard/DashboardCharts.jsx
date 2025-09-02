import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useChartsData } from "../../hooks/useChartsData";

function DashboardCharts() {
  const { areaChartData, donutChartData, monthlyDonutChartData } = useChartsData();

  const revenueRef = useRef(null);
  const salesRef = useRef(null);
  const salesPerMonthRef = useRef(null);

  const revenueChartRef = useRef(null);
  const salesChartRef = useRef(null);
  const salesPerMonthChartRef = useRef(null);

  useEffect(() => {
    // Destroy previous charts
    if (revenueChartRef.current) revenueChartRef.current.destroy();
    if (salesChartRef.current) salesChartRef.current.destroy();
    if (salesPerMonthChartRef.current) salesPerMonthChartRef.current.destroy();

    // ✅ Revenue Line Chart
    if (revenueRef.current && areaChartData?.length) {
      revenueChartRef.current = new Chart(revenueRef.current, {
        type: "line",
        data: {
          labels: areaChartData.map((d) => d.month || "N/A"),
          datasets: [
            {
              label: "Revenue",
              data: areaChartData.map((d) => d.revenue),
              backgroundColor: "rgba(60,141,188,0.2)",
              borderColor: "rgba(60,141,188,1)",
              borderWidth: 2,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // ✅ Sales Donut Chart
    if (salesRef.current && donutChartData?.length) {
      salesChartRef.current = new Chart(salesRef.current, {
        type: "doughnut",
        data: {
          labels: donutChartData.map((d) => d.label || "N/A"),
          datasets: [
            {
              data: donutChartData.map((d) => d.value),
              backgroundColor: ["#f56954", "#00a65a", "#f39c12", "#3c8dbc", "#d2d6de"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // ✅ Sales Per Month Donut Chart
    if (salesPerMonthRef.current && monthlyDonutChartData?.length) {
      salesPerMonthChartRef.current = new Chart(salesPerMonthRef.current, {
        type: "doughnut",
        data: {
          labels: monthlyDonutChartData.map((d) => d.platform || "N/A"),
          datasets: [
            {
              data: monthlyDonutChartData.map((d) => d.value),
              backgroundColor: ["#00c0ef", "#3c8dbc", "#f39c12", "#d81b60", "#605ca8"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [areaChartData, donutChartData, monthlyDonutChartData]);

  return (
    <div className="row">
      {/* Revenue Area Chart */}
      <div className="col-12 col-lg-6 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-line mr-1" /> Revenue
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={revenueRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Donut Chart */}
      <div className="col-12 col-md-6 col-lg-3 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-pie mr-1" /> Sales by Platform
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={salesRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Per Month Donut Chart */}
      <div className="col-12 col-md-6 col-lg-3 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-pie mr-1" /> Sales Per Month
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={salesPerMonthRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
