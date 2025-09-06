import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { path: "/products", label: "Products", icon: "fas fa-box" },
  { path: "/orders", label: "Orders", icon: "fas fa-shopping-cart" },
  { path: "/walk-ins", label: "Walk-Ins", icon: "fas fa-shopping-basket" },
  // { path: "/trackings", label: "Trackings", icon: "fas fa-shipping-fast" },
  // { path: "/order-inventory", label: "Order Inventory", icon: "fas fa-clipboard-check" },
  { path: "/item-inventory", label: "Item Inventory", icon: "fas fa-boxes" },
  { path: "/sales", label: "Sales", icon: "fas fa-receipt" },
  { path: "/reports", label: "Reports", icon: "fas fa-chart-line" },
  // { path: "/users", label: "Users", icon: "fas fa-users" },
  // { path: "/settings", label: "Settings", icon: "fas fa-cog" },
  { path: "/auditlogs", label: "Audit Logs", icon: "fas fa-file-alt" },
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
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            role="menu"
            data-widget="treeview"
            data-accordion="false"
          >
            {menuItems.map(({ path, label, icon }) => (
              <li className="nav-item" key={path}>
                <Link
                  to={path}
                  className={`nav-link ${isActive(path) ? "active" : ""}`}
                >
                  <i className={`nav-icon ${icon}`}></i>
                  {/* Preserve this line for label */}
                  <p className="flex-fill">{label}</p>
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
