import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useChartsData } from "../../hooks/useChartsData";

function DashboardCharts() {
  const { areaChartData, revenueDonutChartData, profitDonutChartData } =
    useChartsData();

  const revenueRef = useRef(null);
  const revenueDonutRef = useRef(null);
  const profitDonutRef = useRef(null);

  const revenueChartInstance = useRef(null);
  const revenueDonutInstance = useRef(null);
  const profitDonutInstance = useRef(null);

  useEffect(() => {
    // Destroy old instances
    [revenueChartInstance, revenueDonutInstance, profitDonutInstance].forEach(
      (chartRef) => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      }
    );

    // ✅ Revenue Area Chart
    if (revenueRef.current && areaChartData?.length) {
      revenueChartInstance.current = new Chart(revenueRef.current, {
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

    // ✅ Revenue Donut Chart
    if (revenueDonutRef.current && revenueDonutChartData?.length) {
      revenueDonutInstance.current = new Chart(revenueDonutRef.current, {
        type: "doughnut",
        data: {
          labels: revenueDonutChartData.map((d) => d.label || "N/A"),
          datasets: [
            {
              label: "Revenue",
              data: revenueDonutChartData.map((d) => d.value),
              backgroundColor: ["#f56954", "#f39c12", "#605ca8"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // ✅ Profit Donut Chart
    if (profitDonutRef.current && profitDonutChartData?.length) {
      profitDonutInstance.current = new Chart(profitDonutRef.current, {
        type: "doughnut",
        data: {
          labels: profitDonutChartData.map((d) => d.label || "N/A"),
          datasets: [
            {
              label: "Profit",
              data: profitDonutChartData.map((d) => d.value),
              backgroundColor: ["#d81b60", "#3c8dbc", "#10b981"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [areaChartData, revenueDonutChartData, profitDonutChartData]);

  return (
    <div className="row">
      {/* Revenue Area Chart */}
      <div className="col-12 col-lg-6 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-line mr-1" /> Revenue Trend
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={revenueRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Donut Chart */}
      <div className="col-12 col-md-6 col-lg-3 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-chart-pie mr-1" /> Revenue by Platform
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={revenueDonutRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Profit Donut Chart */}
      <div className="col-12 col-md-6 col-lg-3 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-coins mr-1" /> Profit by Platform
            </h3>
          </div>
          <div className="card-body">
            <div style={{ position: "relative", height: 300 }}>
              <canvas ref={profitDonutRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
