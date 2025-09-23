// controllers/dashboardController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Item from "../models/Item.js";
import { getYearRange, getCurrentMonthRange } from "../utils/dateUtils.js";
import { getEffectivePriceStage } from "../utils/priceUtils.js";

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

// 📌 Revenue by Month
const getRevenueByMonth = async (year) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);
  const effectivePriceStage = await getEffectivePriceStage();

  const revenueData = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startOfYear, $lte: endOfYear },
        // 🔹 remove hardcoded filters to align with profits report
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

    effectivePriceStage,

    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
      },
    },

    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
        },
        revenue: { $sum: "$revenue" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return revenueData.map((d) => ({
    month: monthNames[d._id.month - 1],
    revenue: d.revenue,
  }));
};

// 📌 Revenue by Platform (Current Month Only)
const getRevenueByPlatform = async () => {
  const { start, end } = getCurrentMonthRange();
  const effectivePriceStage = await getEffectivePriceStage();

  const data = await Order.aggregate([
    // ✅ Filter only current month
    {
      $match: {
        orderDate: { $gte: start, $lte: end },
      },
    },

    // ✅ Attach product details
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },

    // ✅ Compute effective price
    effectivePriceStage,

    // ✅ Group by platform only (no need for month/year in _id)
    {
      $group: {
        _id: "$platform",
        value: { $sum: { $multiply: ["$quantity", "$effectivePrice"] } },
      },
    },

    { $sort: { value: -1 } }, // optional: highest revenue first
  ]);

  // ✅ Return same structure as before
  return data.map((d) => ({
    label: d._id,
    value: d.value,
  }));
};

// 📌 Orders by Platform
const getOrdersByPlatform = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$platform",
        totalOrders: { $sum: "$quantity" },
      },
    },
  ]);

  return data.map((d) => ({ label: d._id, value: d.totalOrders }));
};

// 📌 Profit by Platform (Current Month Only)
const getProfitByPlatform = async () => {
  const { start, end } = getCurrentMonthRange(); // filter by current month
  const effectivePriceStage = await getEffectivePriceStage();

  const data = await Order.aggregate([
    // ✅ Only include current month orders
    {
      $match: {
        orderDate: { $gte: start, $lte: end },
      },
    },

    // ✅ Lookup product details
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },

    // ✅ Lookup item details for cost calculation
    {
      $lookup: {
        from: "items",
        localField: "productInfo.components.item",
        foreignField: "_id",
        as: "itemsInfo",
      },
    },

    // ✅ Attach effective price logic
    effectivePriceStage,

    // ✅ Compute product cost safely
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
                        $ifNull: [
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
                          0, // 👈 fallback if no price found
                        ],
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

    // ✅ Add revenue + profit (ensure no null values)
    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
        profit: {
          $subtract: [
            { $ifNull: [{ $multiply: ["$quantity", "$effectivePrice"] }, 0] },
            { $ifNull: ["$productCost", 0] },
          ],
        },
      },
    },

    // ✅ Group by platform
    {
      $group: {
        _id: "$platform",
        totalRevenue: { $sum: "$revenue" },
        totalCost: { $sum: "$productCost" },
        totalProfit: { $sum: "$profit" },
      },
    },

    { $sort: { totalProfit: -1 } },
  ]);

  // ✅ Return same structure as revenue report
  return data.map((d) => ({
    label: d._id,
    value: d.totalProfit,
  }));
};

// 📌 Monthly Orders by Platform
const getMonthlyOrdersByPlatform = async () => {
  const { start: startOfMonth, end: endOfMonth } = getCurrentMonthRange();

  const data = await Order.aggregate([
    {
      $match: { orderDate: { $gte: startOfMonth, $lte: endOfMonth } },
    },
    {
      $group: {
        _id: "$platform",
        totalOrders: { $sum: "$quantity" },
      },
    },
  ]);

  const now = new Date();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return data.map((d) => ({
    month: monthNames[now.getMonth()],
    platform: d._id,
    value: d.totalOrders,
  }));
};

// 📌 Main Controller
export const getDashboardCharts = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const [
      areaChartData,
      revenueDonutChartData,
      ordersDonutChartData,
      profitDonutChartData,
      monthlyDonutChartData,
    ] = await Promise.all([
      getRevenueByMonth(year),
      getRevenueByPlatform(year),
      getOrdersByPlatform(),
      getProfitByPlatform(),
      getMonthlyOrdersByPlatform(),
    ]);

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

