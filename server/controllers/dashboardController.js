// controllers/dashboardController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Item from "../models/Item.js";
import { getYearRange, getCurrentMonthRange } from "../utils/dateUtils.js";

export const getInventoryStats = async (req, res) => {
  try {
    // 🔹 Product stats
    const [
      totalProducts,
      productsNeedsRestock,
      productsOutOfStock,
      totalProductQuantityResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ quantity: { $lte: 5 } }),
      Product.countDocuments({ quantity: { $lte: 0 } }),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),
    ]);

    // 🔹 Item stats
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
    const year = new Date().getFullYear();

    // 🔹 Revenue by Month (Area Chart - Current Year)
    const { start: startOfYear, end: endOfYear } = getYearRange(year);

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          revenue: { $multiply: ["$quantity", "$product.price"] },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDate" } },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const areaChartData = revenueData.map((d) => ({
      month: monthNames[d._id.month - 1],
      revenue: d.revenue,
    }));

    // 🔹 Overall revenue by Platform
    const revenueByPlatform = await Order.aggregate([
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
          _id: "$platform",
          totalRevenue: {
            $sum: { $multiply: ["$quantity", "$productDetails.price"] },
          },
        },
      },
    ]);

    const revenueDonutChartData = revenueByPlatform.map((d) => ({
      label: d._id,
      value: d.totalRevenue,
    }));

    // 🔹 Overall orders by Platform
    const ordersByPlatform = await Order.aggregate([
      {
        $group: {
          _id: "$platform",
          totalOrders: { $sum: "$quantity" },
        },
      },
    ]);

    const ordersDonutChartData = ordersByPlatform.map((d) => ({
      label: d._id,
      value: d.totalOrders,
    }));

    // 🔹 Overall profit by Platform
    const profitByPlatform = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "items",
          localField: "productInfo.components.item",
          foreignField: "_id",
          as: "itemsInfo",
        },
      },
      {
        $addFields: {
          productCost: {
            $multiply: [
              {
                $sum: {
                  $map: {
                    input: "$productInfo.components",
                    as: "comp",
                    in: {
                      $multiply: [
                        {
                          $getField: {
                            field: "price",
                            input: {
                              $first: {
                                $filter: {
                                  input: "$itemsInfo",
                                  cond: { $eq: ["$$this._id", "$$comp.item"] },
                                },
                              },
                            },
                          },
                        },
                        "$$comp.qty",
                      ],
                    },
                  },
                },
              },
              "$quantity",
            ],
          },
        },
      },
      {
        $addFields: {
          revenue: { $multiply: ["$productInfo.price", "$quantity"] },
          profit: {
            $subtract: [
              { $multiply: ["$productInfo.price", "$quantity"] },
              "$productCost",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$platform",
          totalRevenue: { $sum: "$revenue" },
          totalCost: { $sum: "$productCost" },
          totalProfit: { $sum: "$profit" },
        },
      },
    ]);

    const profitDonutChartData = profitByPlatform.map((d) => ({
      label: d._id,
      value: d.totalProfit,
    }));

    // 🔹 Current Month Orders by Platform
    const { start: startOfMonth, end: endOfMonth } = getCurrentMonthRange();

    const monthlyOrdersByPlatform = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$platform",
          totalOrders: { $sum: "$quantity" },
        },
      },
    ]);

    const now = new Date();
    const monthlyDonutChartData = monthlyOrdersByPlatform.map((d) => ({
      month: monthNames[now.getMonth()],
      platform: d._id,
      value: d.totalOrders,
    }));

    return res.json({
      areaChartData,
      revenueDonutChartData,
      ordersDonutChartData,
      profitDonutChartData,
      monthlyDonutChartData,
    });
  } catch (error) {
    console.error("Error generating dashboard charts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
