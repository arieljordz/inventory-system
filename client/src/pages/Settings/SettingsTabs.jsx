import React from "react";

const SettingsTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { key: "backup", label: "System Backups", icon: "fas fa-database" },
    { key: "feature-flag", label: "Feature Flags", icon: "fas fa-flag" },
    { key: "support", label: "Supports", icon: "fas fa-tools" },
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

export default SettingsTabs;
