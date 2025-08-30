import React, { useState } from "react";

const mockNotifications = [
  { id: 1, message: "New Order has been placed" },
  { id: 2, message: "Order 001 has been delivered" },
  { id: 3, message: "Order 002 has been returned" },
];

const NotificationButton = () => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  return (
    <div className="nav-item dropdown">
      <a
        href="#"
        className="nav-link"
        onClick={toggleDropdown}
        role="button"
        title="Notifications"
      >
        <i className="fas fa-bell"></i>
        {mockNotifications.length > 0 && (
          <span className="badge badge-danger navbar-badge small-badge">
            {mockNotifications.length}
          </span>
        )}
      </a>

      {open && (
        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right show">
          <span className="dropdown-header">
            {mockNotifications.length} Notifications
          </span>
          <div className="dropdown-divider"></div>
          {mockNotifications.map((notif) => (
            <React.Fragment key={notif.id}>
              <a href="#" className="dropdown-item">
                <i className="fas fa-info-circle mr-2"></i>
                {notif.message}
              </a>
              <div className="dropdown-divider"></div>
            </React.Fragment>
          ))}
          <a href="#" className="dropdown-item dropdown-footer">
            View All Notifications
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
