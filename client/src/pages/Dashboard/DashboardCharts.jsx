import React from "react";
import { useChartsData } from "../../hooks/useChartsData";
import ChartCard from "./ChartCard";

function DashboardCharts() {
  const { revenueByMonth, ordersByMonth, revenueByPlatform, profitByPlatform } =
    useChartsData();

  // ✅ Fixed platform order (normalized)
  const PLATFORM_ORDER = ["Shopee", "Tiktok", "Lazada"];
  const colors = ["#36a2eb", "#ff6384", "#ffcd56"];

  // ✅ Helper to normalize platform names
  const normalize = (str) =>
    str ? str.trim().toLowerCase() : "";

  const matchPlatform = (entry, platform) =>
    normalize(entry.platform) === normalize(platform);

  // 📈 Revenue Line Chart
  const revenueChart = {
    type: "line",
    title: "Revenue Trend",
    icon: "fa-chart-line",
    labels: revenueByMonth?.map((d) => d.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: revenueByMonth?.map((d) => d.revenue) || [],
        backgroundColor: "rgba(60,141,188,0.2)",
        borderColor: "rgba(60,141,188,1)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // 📊 Orders Bar Chart (multi-dataset grouped by platform)
  const ordersByPlatformChart = {
    type: "bar",
    title: "Orders by Platform",
    icon: "fa-chart-bar",
    labels: ordersByMonth?.map((d) => d.month) || [],
    datasets:
      PLATFORM_ORDER.map((platform, idx) => ({
        label: platform,
        data:
          ordersByMonth?.map((m) => {
            const entry = m.platforms.find((p) =>
              matchPlatform(p, platform)
            );
            return entry ? entry.orders : 0;
          }) || [],
        backgroundColor: colors[idx % colors.length],
      })) || [],
    options: { scales: { y: { beginAtZero: true } } },
  };

  // 📊 Revenue Bar Chart (multi-dataset grouped by platform)
  const revenueByPlatformChart = {
    type: "bar",
    title: "Revenue by Platform",
    icon: "fa-chart-bar",
    labels: revenueByPlatform?.map((d) => d.month) || [],
    datasets:
      PLATFORM_ORDER.map((platform, idx) => ({
        label: platform,
        data:
          revenueByPlatform?.map((m) => {
            const entry = m.platforms.find((p) =>
              matchPlatform(p, platform)
            );
            return entry ? entry.revenue : 0;
          }) || [],
        backgroundColor: colors[idx % colors.length],
      })) || [],
    options: { scales: { y: { beginAtZero: true } } },
  };

  // 💰 Profit Bar Chart (multi-dataset grouped by platform)
  const profitByPlatformChart = {
    type: "bar",
    title: "Profit by Platform",
    icon: "fa-chart-bar",
    labels: profitByPlatform?.map((d) => d.month) || [],
    datasets:
      PLATFORM_ORDER.map((platform, idx) => ({
        label: platform,
        data:
          profitByPlatform?.map((m) => {
            const entry = m.platforms.find((p) =>
              matchPlatform(p, platform)
            );
            return entry ? entry.profit : 0;
          }) || [],
        backgroundColor: colors[idx % colors.length],
      })) || [],
    options: { scales: { y: { beginAtZero: true } } },
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6 mb-4">
        <ChartCard {...revenueChart} />
      </div>

      <div className="col-12 col-lg-6 mb-4">
        <ChartCard {...ordersByPlatformChart} />
      </div>

      <div className="col-12 col-lg-6 mb-4">
        <ChartCard {...revenueByPlatformChart} />
      </div>

      <div className="col-12 col-lg-6 mb-4">
        <ChartCard {...profitByPlatformChart} />
      </div>
    </div>
  );
}

export default DashboardCharts;
