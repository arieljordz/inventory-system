import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import ThemeToggle from "../common/ThemeToggle"; 

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light fixed-top">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            className="nav-link"
            data-widget="pushmenu"
            href="#"
            role="button"
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
      </ul>

      {/* Right navbar */}
      <ul className="navbar-nav ml-auto align-items-center">
        {/* Theme Toggle */}
        <li className="nav-item mr-2">
          <ThemeToggle />
        </li>

        {/* Logout */}
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
