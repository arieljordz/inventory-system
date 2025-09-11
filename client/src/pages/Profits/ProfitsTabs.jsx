import React from "react";

const ProfitsTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { key: "platform-orders", label: "Platform Orders", icon: "fas fa-shopping-cart" },
    { key: "walk-ins", label: "Walk-In Transactions", icon: "fas fa-cash-register" },
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

export default ProfitsTabs;
