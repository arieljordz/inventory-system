import React from "react";
import NotificationButton from "../common/NotificationButton";
import UserDropdown from "../common/UserDropdown";

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
        {/* <li className="nav-item">
          <NotificationButton />
        </li> */}

        <li className="nav-item">
          <UserDropdown />
        </li>
      </ul>
    </nav>
  );
};

export default Header;
