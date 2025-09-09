import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer text-sm fixed-bottom py-2">
      <div className="float-right d-none d-sm-inline">
        <strong>
          <a href="/documentation" target="_blank" rel="noopener noreferrer">
            Inventory System v1.0
          </a>
        </strong>
      </div>
      <strong>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://www.facebook.com/arieljordz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kuys Jordz
        </a>
        .
      </strong>{" "}
      All rights reserved.
    </footer>
  );
};

export default Footer;
