import moment from "moment-timezone";
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  getPlatformMappings,
  validateFile,
  getSheetRows,
  extractOrderIds,
} from "../utils/importUtils.js";
import { normalizeString, escapeRegex } from "../utils/commonUtils.js";

export const importSalesByPlatform = async (req, res) => {
  try {
    // 1. Validate platform and get mapping
    const platform = req.body.platform;
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    let mapping;
    try {
      mapping = getPlatformMappings(platform, "sales");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { sheetName, fields: fieldMap } = mapping;

    // 2. Validate uploaded file
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // 3. Auto-detect header row & parse sheet
    let rows;
    try {
      rows = getSheetRows(req.file, sheetName, Object.values(fieldMap));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // 4. Extract platform order IDs
    const platformOrderIds = extractOrderIds(rows, fieldMap.platformOrderId);
    if (platformOrderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid order IDs found in file." });
    }

    // 5. Fetch matching orders
    const orders = await Order.find({
      platform: platform.toLowerCase(),
      platformOrderId: { $in: platformOrderIds },
    });

    const results = { updated: [], alreadyPaid: [], notFound: [] };
    const orderMap = new Map(orders.map((o) => [o.platformOrderId, o]));

    // 6. Update payment status and log
    for (const id of platformOrderIds) {
      const order = orderMap.get(id);

      if (!order) {
        results.notFound.push(id);
        continue;
      }

      if (order.isPaid) {
        results.alreadyPaid.push(order._id);
        continue;
      }

      const before = { isPaid: order.isPaid };
      order.isPaid = true;
      await order.save();

      results.updated.push(order._id);

      await logAudit({
        action: "UPDATE",
        user: req.user?._id,
        description: `Marked order ${order._id} as paid via file import (${platform})`,
        collectionName: "Order",
        documentId: order._id,
        before,
        after: { isPaid: true },
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    // 7. Send summary
    res.json({
      message: `${results.updated.length} orders marked as paid.`,
      summary: {
        updated: results.updated.length,
        alreadyPaid: results.alreadyPaid.length,
        notFound: results.notFound.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Error importing sales:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSalesStatsByDate = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || "").trim();
    const { start, end } = req.query;

    const skip = (page - 1) * limit;

    /** 🔹 Date range filter */
    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const todayStart = moment.tz("Asia/Manila").startOf("day").toDate();
    const todayEnd = moment.tz("Asia/Manila").endOf("day").toDate();

    /** 🔹 Base filter */
    let match = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    /** 🔹 Search filter */
    if (search) {
      const normalizedSearch = normalizeString(search);
      const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
      const rawSafeRegex = new RegExp(escapeRegex(search), "i");

      match.$or = [
        { status: rawSafeRegex },
        { "product.normalizedName": safeRegex },
        { "product.normalizedVariant": safeRegex },
        { "product.sku": rawSafeRegex },
        { "product.description": rawSafeRegex },
        { "product.platformOrderId": rawSafeRegex },
      ];
    }

    /** 🔹 Main aggregation pipeline */
    const pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          stats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSales: {
                  $sum: { $multiply: ["$quantity", "$product.price"] },
                },
                unpaidOrders: {
                  $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] },
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    const orders = result[0].data;
    const stats = result[0].stats[0] || {
      totalOrders: 0,
      totalSales: 0,
      unpaidOrders: 0,
    };
    const totalOrders = result[0].total[0]?.count || 0;

    /** 🔹 Today’s revenue aggregation */
    const todaysRevenueAgg = await Order.aggregate([
      {
        $match: { createdAt: { $gte: todayStart, $lte: todayEnd } },
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
        $group: {
          _id: null,
          revenueToday: {
            $sum: { $multiply: ["$quantity", "$product.price"] },
          },
        },
      },
    ]);

    const revenueToday = todaysRevenueAgg[0]?.revenueToday || 0;

    res.json({
      orders,
      totalOrders,
      totalPages: Math.max(Math.ceil(totalOrders / limit), 1),
      currentPage: page,
      pageSize: limit,
      totalSales: stats.totalSales,
      unpaidOrders: stats.unpaidOrders,
      revenueToday,
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({ message: "Failed to get order stats" });
  }
};
