import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import Navpath from "../../components/Navpath";
import { useSpinner } from "../../context/SpinnerContext";

const NewReportsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  return (
    <>
      <Navpath
        levelOne="Reports Management"
        levelTwo="Home"
        levelThree="Reports"
      />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Generate Report</h3>
            </div>
            <div className="card-body"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewReportsPage;
