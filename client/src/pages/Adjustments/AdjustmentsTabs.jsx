import React from "react";

const AdjustmentsTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { key: "products", label: "Products", icon: "fas fa-cube" },
    { key: "items", label: "Items", icon: "fas fa-layer-group" },
  ];

  return (
    <div className="card-header d-flex">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`btn btn-sm me-2 ${
            activeTab === tab.key ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => onChange(tab.key)}
        >
          <i className={`${tab.icon} me-1`}></i>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdjustmentsTabs;
