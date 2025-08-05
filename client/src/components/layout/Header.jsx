import React from "react";

import ThemeToggle from "../common/ThemeToggle";
import LogoutButton from "../common/LogoutButton";
import NotificationButton from "../common/NotificationButton";

const Header = () => {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light fixed-top">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
      </ul>

      {/* Right navbar */}
      <ul className="navbar-nav ml-auto align-items-center">
        {/* <NotificationButton /> */}
        <li className="nav-item">
          <ThemeToggle />
        </li>
        <li className="nav-item">
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
};

export default Header;
