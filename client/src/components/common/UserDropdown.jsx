import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Swal from "sweetalert2";

const UserDropdown = () => {
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); // 👈 use ThemeContext
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from the system.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
    });

    if (result.isConfirmed) {
      await logout();
      navigate("/");
    }
  };

  return (
    <div className="nav-item dropdown" ref={dropdownRef}>
      {/* Avatar as trigger */}
      <a
        href="#"
        className="nav-link d-flex align-items-center"
        onClick={toggleDropdown}
        role="button"
        title="User Menu"
      >
        <img
          src={
            user?.picture && user.picture.trim() !== ""
              ? user.picture
              : "/default-avatar.png"
          }
          alt="User Avatar"
          className="rounded-circle"
          style={{
            width: "32px",
            height: "32px",
            objectFit: "cover",
          }}
        />
      </a>

      {/* Dropdown */}
      {open && (
        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right show">
          <span className="dropdown-header">Account</span>
          <div className="dropdown-divider"></div>

          {/* Profile */}
          <button
            className="dropdown-item"
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <i className="fas fa-user mr-2"></i> Profile
          </button>
          <div className="dropdown-divider"></div>

          {/* Theme Toggle */}
          <button className="dropdown-item" onClick={toggleDarkMode}>
            <i
              className={`fas ${
                darkMode ? "fa-sun" : "fa-moon"
              } mr-2`}
            ></i>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="dropdown-divider"></div>

          {/* Logout */}
          <button className="dropdown-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
