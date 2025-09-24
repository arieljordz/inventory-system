import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function ChartCard({ title, icon, type, labels, datasets, options }) {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy previous instance before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (canvasRef.current && labels?.length && datasets?.length) {
      chartInstance.current = new Chart(canvasRef.current, {
        type,
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: false, ...options },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, datasets, type, options]);

  return (
    <div className="card h-100">
      <div className="card-header">
        <h3 className="card-title">
          <i className={`fas ${icon} mr-1`} /> {title}
        </h3>
      </div>
      <div className="card-body">
        <div style={{ position: "relative", height: 300 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

export default ChartCard;
