// controllers/dashboardController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Item from "../models/Item.js";
import mongoose from "mongoose";

export const getInventoryStats = async (req, res) => {
  try {
    // 🔹 Product stats in parallel
    const [
      totalProducts,
      productsNeedsRestock,
      productsOutOfStock,
      totalProductQuantityResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ quantity: { $lte: 5 } }),
      Product.countDocuments({ quantity: { $lte: 0 } }),
      Product.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
    ]);

    // 🔹 Item stats in parallel
    const [
      totalItems,
      itemsNeedsRestock,
      itemsOutOfStock,
      totalItemQuantityResult,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ quantity: { $lte: 5 } }),
      Item.countDocuments({ quantity: { $lte: 0 } }),
      Item.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
    ]);

    res.json({
      totalProducts,
      productsNeedsRestock,
      productsOutOfStock,
      totalProductQuantity: totalProductQuantityResult[0]?.total || 0,
      totalItems,
      itemsNeedsRestock,
      itemsOutOfStock,
      totalItemQuantity: totalItemQuantityResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get Inventory Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardCharts = async (req, res) => {
  try {
    // 🔹 Revenue by Month (Area Chart)
    const revenueData = await Order.aggregate([
      { $match: { orderDate: { $ne: null } } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: { $month: "$orderDate" },
          revenue: {
            $sum: { $multiply: ["$quantity", "$productDetails.price"] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const areaChartData = revenueData.map((d) => ({
      month: monthNames[d._id - 1],
      revenue: d.revenue,
    }));

    // 🔹 Overall Sales Distribution by Platform (Donut Chart)
    const donutData = await Order.aggregate([
      {
        $group: {
          _id: "$platform",
          totalSales: { $sum: "$quantity" },
        },
      },
    ]);

    const donutChartData = donutData.map((d) => ({
      label: d._id,
      value: d.totalSales,
    }));

    // 🔹 Current Month Sales Distribution by Platform (Donut Chart)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyDonutData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$platform",
          totalSales: { $sum: "$quantity" },
        },
      },
    ]);

    const monthlyDonutChartData = monthlyDonutData.map((d) => ({
      month: monthNames[now.getMonth()],
      platform: d._id,
      value: d.totalSales,
    }));

    // console.log("monthlyDonutChartData:", monthlyDonutChartData);

    return res.json({
      areaChartData,
      donutChartData,
      monthlyDonutChartData,
    });
  } catch (error) {
    console.error("Error generating dashboard charts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
