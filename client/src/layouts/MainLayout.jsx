import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="wrapper">
      <Header />
      <Sidebar />

      <div className="content-wrapper">
        <div className="content pt-3">
          <div className="container-fluid pt-5 pb-5">
            <Outlet />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
