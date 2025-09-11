import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuStructure = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "fas fa-chart-pie",
  },
  {
    label: "Inventory",
    icon: "fas fa-archive",
    children: [
      { path: "/products", label: "Products", icon: "fas fa-cube" },
      { path: "/items", label: "Items", icon: "fas fa-layer-group" },
      {
        path: "/price-adjustments",
        label: "Price Adjustments",
        icon: "fas fa-tags",
      },
    ],
  },
  {
    label: "Transactions",
    icon: "fas fa-exchange-alt",
    children: [
      { path: "/orders", label: "Orders", icon: "fas fa-shopping-cart" },
      { path: "/walk-ins", label: "Walk-Ins", icon: "fas fa-cash-register" },
    ],
  },
  {
    label: "Financials",
    icon: "fas fa-coins",
    children: [
      { path: "/sales", label: "Sales", icon: "fas fa-receipt" },
      { path: "/cost-profits", label: "Cost & Profits", icon: "fas fa-calculator" },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "fas fa-chart-bar",
  },
  {
    label: "Audit Logs",
    path: "/auditlogs",
    icon: "fas fa-history",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4 d-flex flex-column">
      {/* Brand Logo */}
      <div className="brand-link d-flex align-items-center">
        <img
          src="/images/is-icon.png"
          alt="Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: 0.9, width: "35px", height: "35px" }}
        />
        <span className="brand-text ml-2 font-weight-light">INVENTORY</span>
      </div>

      {/* Sidebar Content */}
      <div className="d-flex flex-column flex-grow-1">
        <nav className="mt-2 flex-grow-1">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            role="menu"
            data-widget="treeview"
            data-accordion="false"
          >
            {menuStructure.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className={`nav-item has-treeview ${
                    openMenu === item.label ||
                    item.children.some((child) => isActive(child.path))
                      ? "menu-open"
                      : ""
                  }`}
                >
                  <a
                    href="#"
                    className="nav-link"
                    onClick={() => toggleMenu(item.label)}
                  >
                    <i className={`nav-icon ${item.icon}`}></i>
                    <p>
                      {item.label}
                      <i className="right fas fa-angle-left"></i>
                    </p>
                  </a>
                  <ul className="nav nav-treeview">
                    {item.children.map((child) => (
                      <li className="nav-item" key={child.path}>
                        <Link
                          to={child.path}
                          className={`nav-link ${
                            isActive(child.path) ? "active" : ""
                          }`}
                          style={{ paddingLeft: "2rem" }} // indent child items
                        >
                          <i className={`nav-icon ${child.icon}`}></i>
                          <p>{child.label}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav-item" key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  >
                    <i className={`nav-icon ${item.icon}`}></i>
                    <p>{item.label}</p>
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
