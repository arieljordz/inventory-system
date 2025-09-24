// controllers/dashboardController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Item from "../models/Item.js";
import { getYearRange } from "../utils/dateUtils.js";
import { getEffectivePriceStage } from "../utils/priceUtils.js";

export const getInventoryStats = async (req, res) => {
  try {
    // 🔹 Product stats
    const [productsNeedsRestock, productsOutOfStock] = await Promise.all([
      Product.countDocuments({ quantity: { $lte: 10 } }),
      Product.countDocuments({ quantity: { $lte: 0 } }),
    ]);

    // 🔹 Item stats
    const [itemsNeedsRestock, itemsOutOfStock] = await Promise.all([
      Item.countDocuments({ quantity: { $lte: 5 } }),
      Item.countDocuments({ quantity: { $lte: 0 } }),
    ]);

    res.json({
      productsNeedsRestock,
      productsOutOfStock,
      itemsNeedsRestock,
      itemsOutOfStock,
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

  return revenueData.map((d) => ({
    month: monthNames[d._id.month - 1],
    revenue: d.revenue,
  }));
};

// 📌 Orders by Month grouped by Platform
const getOrdersByMonthPlatform = async (year) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);

  const ordersData = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
          platform: "$platform",
        },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
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

  // 🔹 Restructure into grouped by month
  const grouped = {};
  ordersData.forEach((d) => {
    const month = monthNames[d._id.month - 1];
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push({
      platform: d._id.platform,
      orders: d.totalOrders,
    });
  });

  // 🔹 Convert to array
  return Object.entries(grouped).map(([month, platforms]) => ({
    month,
    platforms,
  }));
};

// 📌 Revenue by Month + Platform
const getRevenueByMonthPlatform = async (year) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);
  const effectivePriceStage = await getEffectivePriceStage();

  const pipeline = [
    // Match orders within the year
    { $match: { orderDate: { $gte: startOfYear, $lte: endOfYear } } },

    // Lookup product
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // Lookup items referenced in product components (not strictly needed for revenue,
    // but kept here for parity with profit pipeline so both stay in sync)
    {
      $lookup: {
        from: "items",
        localField: "product.components.item",
        foreignField: "_id",
        as: "itemsInfo",
      },
    },

    // Attach effective price stage
    effectivePriceStage,

    // Compute revenue
    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
      },
    },

    // Group by year+month+platform
    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
          platform: "$platform",
        },
        totalRevenue: { $sum: "$revenue" },
      },
    },

    // Sort results
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.platform": 1 } },
  ];

  const data = await Order.aggregate(pipeline);

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

  // ✅ Reshape into { month, platforms[] }
  const grouped = {};
  data.forEach((d) => {
    const month = monthNames[d._id.month - 1];
    if (!grouped[month]) grouped[month] = { month, platforms: [] };

    grouped[month].platforms.push({
      platform: d._id.platform,
      revenue: d.totalRevenue,
    });
  });

  return Object.values(grouped);
};

// 📌 Profit by Month + Platform
const getProfitByMonthPlatform = async (year) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);
  const effectivePriceStage = await getEffectivePriceStage();

  const pipeline = [
    // Match orders within year
    { $match: { orderDate: { $gte: startOfYear, $lte: endOfYear } } },

    // Lookup product
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // Attach effective price stage
    effectivePriceStage,

    // ✅ Revenue first (safe from lookup duplication)
    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
      },
    },

    // Lookup items after revenue is fixed
    {
      $lookup: {
        from: "items",
        localField: "product.components.item",
        foreignField: "_id",
        as: "itemsInfo",
      },
    },

    // ✅ Compute cost per unit × quantity
    {
      $addFields: {
        cost: {
          $multiply: [
            {
              $ifNull: [
                {
                  $sum: {
                    $map: {
                      input: "$product.components",
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
                                        cond: {
                                          $eq: ["$$this._id", "$$comp.item"],
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                              0,
                            ],
                          },
                          "$$comp.qty",
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            "$quantity", // ✅ scale by order quantity
          ],
        },
      },
    },

    // Compute profit
    {
      $addFields: {
        profit: { $subtract: ["$revenue", "$cost"] },
      },
    },

    // Group by year+month+platform
    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
          platform: "$platform",
        },
        totalRevenue: { $sum: "$revenue" },
        totalProfit: { $sum: "$profit" },
      },
    },

    // Sort results
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.platform": 1 } },
  ];

  const data = await Order.aggregate(pipeline);

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

  // ✅ Reshape into { month, platforms[] }
  const grouped = {};
  data.forEach((d) => {
    const month = monthNames[d._id.month - 1];
    if (!grouped[month]) grouped[month] = { month, platforms: [] };

    grouped[month].platforms.push({
      platform: d._id.platform,
      revenue: d.totalRevenue,
      profit: d.totalProfit,
    });
  });

  return Object.values(grouped);
};

// 📌 Main Controller
export const getDashboardCharts = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const [revenueByMonth, ordersByMonth, revenueByPlatform, profitByPlatform] =
      await Promise.all([
        getRevenueByMonth(year),
        getOrdersByMonthPlatform(year),
        getRevenueByMonthPlatform(year),
        getProfitByMonthPlatform(year),
      ]);

    return res.json({
      revenueByMonth,
      ordersByMonth,
      revenueByPlatform,
      profitByPlatform,
    });
  } catch (error) {
    console.error("Error generating dashboard charts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
