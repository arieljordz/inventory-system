import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/Navpath";

const ProfitsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();


  return (
    <>
      <Navpath
        levelOne="Cost & Profits"
        levelTwo="Home"
        levelThree="Cost & Profits"
      />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
       
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfitsPage;
