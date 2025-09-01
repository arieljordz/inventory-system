import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useChartsData } from "../../hooks/useChartsData";

function DashboardCharts() {
  const { areaChartData, donutChartData, lineChartData } = useChartsData();

  const revenueRef = useRef(null);
  const salesRef = useRef(null);
  const lineRef = useRef(null);

  // Keep chart instances to destroy before re-creating
  const revenueChartRef = useRef(null);
  const salesChartRef = useRef(null);
  const lineChartRef = useRef(null);

  useEffect(() => {
    // Destroy previous chart if exists
    if (revenueChartRef.current) revenueChartRef.current.destroy();
    if (salesChartRef.current) salesChartRef.current.destroy();
    if (lineChartRef.current) lineChartRef.current.destroy();

    // Revenue (Area) Chart
    if (revenueRef.current) {
      revenueChartRef.current = new Chart(revenueRef.current, {
        type: "line",
        data: {
          labels: areaChartData.map(d => d.month),
          datasets: [
            {
              label: "Revenue",
              data: areaChartData.map(d => d.revenue),
              backgroundColor: "rgba(60,141,188,0.2)",
              borderColor: "rgba(60,141,188,1)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Donut Chart
    if (salesRef.current) {
      salesChartRef.current = new Chart(salesRef.current, {
        type: "doughnut",
        data: {
          labels: donutChartData.map(d => d.label),
          datasets: [
            {
              data: donutChartData.map(d => d.value),
              backgroundColor: ["#f56954", "#00a65a", "#f39c12"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Line Chart
    if (lineRef.current) {
      lineChartRef.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: lineChartData.map(d => d.month),
          datasets: [
            {
              label: "Mail-Orders",
              data: lineChartData.map(d => d.mailOrders),
              borderColor: "#f56954",
              fill: false,
            },
            {
              label: "Online",
              data: lineChartData.map(d => d.online),
              borderColor: "#00a65a",
              fill: false,
            },
            {
              label: "In-Store",
              data: lineChartData.map(d => d.inStore),
              borderColor: "#f39c12",
              fill: false,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [areaChartData, donutChartData, lineChartData]);

  return (
    <div>
      <div className="row">
        <div className="col-6">
          {/* Sales Card with Tabs */}
          <div className="card">
            <div className="card-header ui-sortable-handle" style={{ cursor: "move" }}>
              <h3 className="card-title">
                <i className="fas fa-chart-pie mr-1" /> Sales
              </h3>
              <div className="card-tools">
                <ul className="nav nav-pills ml-auto">
                  <li className="nav-item">
                    <a className="nav-link active" href="#revenue-chart" data-toggle="tab">
                      Area
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#sales-chart" data-toggle="tab">
                      Donut
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <div className="tab-content p-0">
                <div className="chart tab-pane active" id="revenue-chart" style={{ position: "relative", height: 300 }}>
                  <canvas ref={revenueRef} style={{ height: "300px", width: "100%" }} />
                </div>
                <div className="chart tab-pane" id="sales-chart" style={{ position: "relative", height: 300 }}>
                  <canvas ref={salesRef} style={{ height: "300px", width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6">
          {/* Sales Graph Card */}
          <div className="card bg-gradient-info">
            <div className="card-header border-0 ui-sortable-handle" style={{ cursor: "move" }}>
              <h3 className="card-title">
                <i className="fas fa-th mr-1" /> Sales Graph
              </h3>
            </div>
            <div className="card-body">
              <canvas ref={lineRef} style={{ minHeight: 250, height: 250, maxHeight: 250, width: "100%" }} />
            </div>
            <div className="card-footer bg-transparent">
              <div className="row">
                <div className="col-4 text-center text-white">Mail-Orders</div>
                <div className="col-4 text-center text-white">Online</div>
                <div className="col-4 text-center text-white">In-Store</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
