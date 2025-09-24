import React, { useEffect, useState } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/Navpath";
import { getInventoryStats } from "../../services/dashboardService";
import DashboardCharts from "./DashboardCharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    productsNeedsRestock: 0,
    productsOutOfStock: 0,
    itemsNeedsRestock: 0,
    itemsOutOfStock: 0,
  });

  const { hideSpinner } = useSpinner();
  const navigate = useNavigate();

  useEffect(() => {
    hideSpinner();
  }, [hideSpinner]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getInventoryStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const productBoxes = [
    {
      color: "warning",
      count: stats.productsNeedsRestock,
      label: "Products Needs Restock",
      icon: "ion ion-alert",
      path: "/products",
    },
    {
      color: "danger",
      count: stats.productsOutOfStock,
      label: "Products Out of Stock",
      icon: "ion ion-close",
      path: "/products",
    },
  ];

  const itemBoxes = [
    {
      color: "orange",
      count: stats.itemsNeedsRestock,
      label: "Items Needs Restock",
      icon: "ion ion-alert",
      path: "/items",
    },
    {
      color: "maroon",
      count: stats.itemsOutOfStock,
      label: "Items Out of Stock",
      icon: "ion ion-close",
      path: "/items",
    },
  ];

  const boxes = [...productBoxes, ...itemBoxes];

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
                    onClick={() => navigate(box.path)} // 🔹 navigate on click
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
          <div>
            <DashboardCharts />
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
