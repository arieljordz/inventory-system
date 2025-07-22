import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="wrapper">
      <Header />
      <Sidebar />

      <div className="content-wrapper">
        <div className="content pt-3">
          <div className="container-fluid pt-5 pb-3">
            <Outlet />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
