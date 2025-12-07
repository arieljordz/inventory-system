// controllers/dashboardController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Item from "../models/Item.js";
import Settings from "../models/Settings.js";
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

// 📌 Revenue by Month + Platform (Minus Commission)
const getRevenueByMonthPlatform = async (year, commissionRate = 0.25) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);
  const effectivePriceStage = await getEffectivePriceStage();

  const pipeline = [
    { $match: { orderDate: { $gte: startOfYear, $lte: endOfYear } } },

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
      $lookup: {
        from: "items",
        localField: "product.components.item",
        foreignField: "_id",
        as: "itemsInfo",
      },
    },

    effectivePriceStage,

    // Compute revenue
    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
      },
    },

    // Deduct commission (dynamic)
    {
      $addFields: {
        netRevenue: {
          $multiply: [
            "$revenue",
            { $subtract: [1, commissionRate] }, // 1 - 0.25 = 0.75
          ],
        },
      },
    },

    // Group by year, month, platform
    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
          platform: "$platform",
        },
        totalRevenue: { $sum: "$netRevenue" },
      },
    },

    { $sort: { "_id.year": 1, "_id.month": 1, "_id.platform": 1 } },
  ];

  const data = await Order.aggregate(pipeline);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

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

// 📌 Profit by Month + Platform (with Commission Deduction)
const getProfitByMonthPlatform = async (year, commissionRate = 0.25) => {
  const { start: startOfYear, end: endOfYear } = getYearRange(year);
  const effectivePriceStage = await getEffectivePriceStage();

  const pipeline = [
    // Match yearly orders
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

    // Attach effective price
    effectivePriceStage,

    // Compute base revenue
    {
      $addFields: {
        revenue: { $multiply: ["$quantity", "$effectivePrice"] },
      },
    },

    // 🔍 Deduct commission
    {
      $addFields: {
        netRevenue: {
          $multiply: [
            "$revenue",
            { $subtract: [1, commissionRate] } // e.g., 1 - 0.25 = 0.75
          ]
        }
      }
    },

    // Items lookup (after revenue is fixed)
    {
      $lookup: {
        from: "items",
        localField: "product.components.item",
        foreignField: "_id",
        as: "itemsInfo",
      },
    },

    // Compute total cost of components × quantity
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
                                        cond: { $eq: ["$$this._id", "$$comp.item"] }
                                      }
                                    }
                                  }
                                }
                              },
                              0
                            ]
                          },
                          "$$comp.qty"
                        ]
                      }
                    }
                  }
                },
                0
              ]
            },
            "$quantity"
          ]
        }
      }
    },

    // Final profit = net revenue minus cost
    {
      $addFields: {
        profit: { $subtract: ["$netRevenue", "$cost"] }
      }
    },

    // Group by month + platform
    {
      $group: {
        _id: {
          year: { $year: { date: "$orderDate", timezone: "Asia/Manila" } },
          month: { $month: { date: "$orderDate", timezone: "Asia/Manila" } },
          platform: "$platform",
        },
        totalRevenue: { $sum: "$netRevenue" },
        totalProfit: { $sum: "$profit" },
      },
    },

    { $sort: { "_id.year": 1, "_id.month": 1, "_id.platform": 1 } },
  ];

  const data = await Order.aggregate(pipeline);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const grouped = {};
  data.forEach((d) => {
    const month = monthNames[d._id.month - 1];
    if (!grouped[month]) grouped[month] = { month, platforms: [] };

    grouped[month].platforms.push({
      platform: d._id.platform,
      revenue: d.totalRevenue, // already net revenue
      profit: d.totalProfit,
    });
  });

  return Object.values(grouped);
};

// 📌 Main Controller
export const getDashboardCharts = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // 🔍 1. Fetch commission rate from Settings
    const setting = await Settings.findOne({ key: "commissionRate" });
    const commissionRate = setting ? Number(setting.value) : 0.25;

    // 📌 2. Run async chart calculations with commission
    const [
      revenueByMonth,
      ordersByMonth,
      revenueByPlatform,
      profitByPlatform
    ] = await Promise.all([
      getRevenueByMonth(year), // No commission here
      getOrdersByMonthPlatform(year),
      getRevenueByMonthPlatform(year, commissionRate),
      getProfitByMonthPlatform(year, commissionRate)
    ]);

    // 📌 3. Return combined dashboard data
    return res.json({
      commissionRate,
      revenueByMonth,
      ordersByMonth,
      revenueByPlatform,
      profitByPlatform
    });

  } catch (error) {
    console.error("Error generating dashboard charts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

