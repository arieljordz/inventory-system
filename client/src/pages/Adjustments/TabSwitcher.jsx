import React from "react";

const TabSwitcher = ({ activeTab, onChange }) => {
  const tabs = [
    { key: "products", label: "Products" },
    { key: "items", label: "Items" },
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
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
