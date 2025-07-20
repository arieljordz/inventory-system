import React, { useState } from "react";
import Navpath from "../../components/common/Navpath";

const SalesPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });

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
              <button className="btn btn-primary btn-block">Filter</button>
            </div>
          </div>

          {/* Sales Table Placeholder */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sales Records</h3>
            </div>
            <div className="card-body table-responsive">
              {/* Replace this with your actual table */}
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
                  <tr>
                    <td>1</td>
                    <td>Juan Dela Cruz</td>
                    <td>Product A</td>
                    <td>₱1,200</td>
                    <td>
                      <span className="badge bg-success">Completed</span>
                    </td>
                    <td>2025-07-20</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Maria Santos</td>
                    <td>Product B</td>
                    <td>₱850</td>
                    <td>
                      <span className="badge bg-warning">Pending</span>
                    </td>
                    <td>2025-07-20</td>
                  </tr>
                  {/* Add dynamic data here later */}
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
