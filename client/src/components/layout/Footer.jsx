import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer text-sm fixed-bottom py-2">
      <div className="float-right d-none d-sm-inline">
        Inventory System v1.0
      </div>
      <strong>
        &copy; {new Date().getFullYear()} <a href="/">Jordz Solutions</a>.
      </strong>{" "}
      All rights reserved.
    </footer>
  );
};

export default Footer;
