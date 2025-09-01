import React, { useEffect, useState } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/Navpath";
import { getProductStats } from "../../services/productService";
import DashboardCharts from "./DashboardCharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    needsRestock: 0,
    outOfStock: 0,
  });

  const { hideSpinner } = useSpinner();

  useEffect(() => {
    hideSpinner();
  }, [hideSpinner]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getProductStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const boxes = [
    {
      color: "info",
      count: stats.totalProducts,
      label: "Total Products",
      icon: "ion ion-cube",
    },
    {
      color: "success",
      count: stats.totalQuantity,
      label: "Total Stock",
      icon: "ion ion-archive",
    },
    {
      color: "warning",
      count: stats.needsRestock,
      label: "Needs Restock",
      icon: "ion ion-alert-circled",
    },
    {
      color: "danger",
      count: stats.outOfStock,
      label: "Out of Stock",
      icon: "ion ion-close-circled",
    },
  ];

  return (
    <>
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {boxes.map((box, index) => {
              const countStr = String(box.count);
              const hasPercent = countStr.includes("%");
              const number = hasPercent ? countStr.replace("%", "") : countStr;

              return (
                <div className="col-lg-3 col-6" key={index}>
                  <div
                    className={`small-box bg-${box.color}`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="inner">
                      <h3>
                        {hasPercent ? (
                          <>
                            {number}
                            <sup style={{ fontSize: 20 }}>%</sup>
                          </>
                        ) : (
                          number
                        )}
                      </h3>
                      <p>{box.label}</p>
                    </div>
                    <div className="icon">
                      <i className={box.icon}></i>
                    </div>
                    <div className="small-box-footer text-white">
                      Click to view <i className="fas fa-arrow-circle-right" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row">
            <DashboardCharts />
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
