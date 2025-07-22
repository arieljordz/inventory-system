import React, { useState, useEffect } from "react";
import Navpath from "../../components/common/Navpath";

const SalesPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });
  const [salesData, setSalesData] = useState([]);

  const handleFilter = () => {
    // Simulated API call - replace with your actual API call logic
    const filteredData = [
      {
        id: 1,
        customer: "Juan Dela Cruz",
        product: "Product A",
        total: 1200,
        status: "Completed",
        date: "2025-07-20",
      },
      {
        id: 2,
        customer: "Maria Santos",
        product: "Product B",
        total: 850,
        status: "Pending",
        date: "2025-07-20",
      },
    ];
    setSalesData(filteredData);
  };

  useEffect(() => {
    handleFilter(); // Initial load with today's data
  }, []);

  return (
    <>
      <Navpath levelOne="Sales" levelTwo="Home" levelThree="Sales" />
      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox
              label="Total Sales"
              icon="fas fa-dollar-sign"
              color="success"
              value="₱50,000"
            />
            <InfoBox
              label="Total Orders"
              icon="fas fa-receipt"
              color="primary"
              value="120"
            />
            <InfoBox
              label="Revenue Today"
              icon="fas fa-calendar-day"
              color="info"
              value="₱4,200"
            />
            <InfoBox
              label="Pending Orders"
              icon="fas fa-clock"
              color="warning"
              value="5"
            />
          </div>

          {/* Filters */}
          <div className="row mb-3 align-items-end">
            <div className="col-md-3">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-md-3">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary btn-block" onClick={handleFilter}>
                Filter
              </button>
            </div>
          </div>

          {/* Sales Table */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">Sales Records</h3>
              <button className="btn btn-outline-info btn-sm">
                <i className="fas fa-store"></i> Check Shopee Sales
              </button>
            </div>
            <div className="card-body table-responsive">
              <table className="table table-bordered table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No sales data found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    salesData.map((sale, index) => (
                      <tr key={sale.id}>
                        <td>{index + 1}</td>
                        <td>{sale.customer}</td>
                        <td>{sale.product}</td>
                        <td>₱{sale.total}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              sale.status === "Completed"
                                ? "success"
                                : sale.status === "Pending"
                                ? "warning"
                                : "secondary"
                            }`}
                          >
                            {sale.status}
                          </span>
                        </td>
                        <td>{sale.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// InfoBox Subcomponent
const InfoBox = ({ label, icon, color, value }) => (
  <div className="col-md-3 col-sm-6 col-12">
    <div className={`info-box bg-${color}`}>
      <span className="info-box-icon">
        <i className={icon}></i>
      </span>
      <div className="info-box-content">
        <span className="info-box-text">{label}</span>
        <span className="info-box-number">{value}</span>
      </div>
    </div>
  </div>
);

export default SalesPage;
