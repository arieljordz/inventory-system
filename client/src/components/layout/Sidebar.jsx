import React from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { path: "/products", label: "Products", icon: "fas fa-boxes" },
  { path: "/orders", label: "Orders", icon: "fas fa-shopping-cart" },
  { path: "/trackings", label: "Trackings", icon: "fas fa-map-marker-alt" },
  { path: "/inventory", label: "Inventory", icon: "fas fa-warehouse" },
  { path: "/sales", label: "Sales", icon: "fas fa-cash-register" },
  { path: "/reports", label: "Reports", icon: "fas fa-chart-bar" },
];

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

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

      {/* Sidebar Content Wrapper (Flex column with grow) */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Menu Items */}
        <nav className="mt-2 flex-grow-1">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            {menuItems.map(({ path, label, icon }) => (
              <li className="nav-item" key={path}>
                <Link
                  to={path}
                  className={`nav-link ${isActive(path) ? "active" : ""}`}
                >
                  <i className={`nav-icon ${icon}`}></i>
                  <p>{label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout at Bottom */}
        {/* <div className="mt-auto p-3">
          <LogoutButton />
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
