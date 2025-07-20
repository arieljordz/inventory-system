import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link to="/dashboard" className="brand-link d-flex align-items-center">
        <img
          src="/images/vms-icon.png" 
          alt="Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: 0.9, width: "35px", height: "35px" }}
        />
        <span className="brand-text font-weight-light ml-2">Inventory System</span>
      </Link>

      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            <li className="nav-item">
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/products"
                className={`nav-link ${isActive("/products") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-boxes"></i>
                <p>Products</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/trackings"
                className={`nav-link ${isActive("/trackings") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-shipping-fast"></i>
                <p>Tracking</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/inventory"
                className={`nav-link ${isActive("/inventory") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-box"></i>
                <p>Inventory</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/sales"
                className={`nav-link ${isActive("/sales") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-chart-line"></i>
                <p>Sales</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reports"
                className={`nav-link ${isActive("/reports") ? "active" : ""}`}
              >
                <i className="nav-icon fas fa-file-alt"></i>
                <p>Reports</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
