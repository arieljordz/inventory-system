import React from "react";

const SalesFilter = ({ dateRange, onDateChange, onFilter }) => {
  return (
    <div className="row mb-3 align-items-end">
      <div className="col-md-3">
        <label>Start Date</label>
        <input
          type="date"
          className="form-control"
          value={dateRange.startDate}
          onChange={(e) =>
            onDateChange((prev) => ({ ...prev, startDate: e.target.value }))
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
            onDateChange((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
      </div>
      <div className="col-md-2">
        <button className="btn btn-primary btn-block" onClick={onFilter}>
          Filter
        </button>
      </div>
    </div>
  );
};

export default SalesFilter;
