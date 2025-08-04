import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    path: "/products",
    label: "Products",
    icon: "fas fa-boxes", // Inventory items
  },
  {
    path: "/orders",
    label: "Orders",
    icon: "fas fa-shopping-cart", // Order cart icon
  },
  {
    path: "/trackings",
    label: "Trackings",
    icon: "fas fa-map-marker-alt", // Location/Tracking
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: "fas fa-warehouse", // Warehouse
  },
  {
    path: "/sales",
    label: "Sales",
    icon: "fas fa-cash-register", // Cash register
  },
  {
    path: "/reports",
    label: "Reports",
    icon: "fas fa-chart-bar", // Report chart
  },
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
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

      {/* Sidebar Menu */}
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            {menuItems.map(({ path, label, icon }) => (
              <li className="nav-item" key={path}>
                <Link to={path} className={`nav-link ${isActive(path) ? "active" : ""}`}>
                  <i className={`nav-icon ${icon}`}></i>
                  <p>{label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
