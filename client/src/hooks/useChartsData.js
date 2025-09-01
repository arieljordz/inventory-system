// src/hooks/useChartsData.jsx
import { useState, useEffect } from "react";

// Helper to generate random integers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1));

export const useChartsData = () => {
  const [areaChartData, setAreaChartData] = useState([]);
  const [donutChartData, setDonutChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  useEffect(() => {
    // Mock Area Chart (Revenue over time)
    const area = [];
    for (let i = 1; i <= 12; i++) {
      area.push({ month: `Month ${i}`, revenue: randomInt(5000, 20000) });
    }
    setAreaChartData(area);

    // Mock Donut Chart (Sales distribution)
    const donut = [
      { label: "Online", value: randomInt(50, 200) },
      { label: "Mail-Orders", value: randomInt(50, 200) },
      { label: "In-Store", value: randomInt(50, 200) },
    ];
    setDonutChartData(donut);

    // Mock Line Chart (Sales graph over months)
    const line = [];
    for (let i = 1; i <= 12; i++) {
      line.push({
        month: `Month ${i}`,
        mailOrders: randomInt(20, 100),
        online: randomInt(50, 200),
        inStore: randomInt(10, 80),
      });
    }
    setLineChartData(line);
  }, []);

  return { areaChartData, donutChartData, lineChartData };
};
