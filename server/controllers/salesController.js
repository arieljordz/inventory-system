import * as XLSX from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  salesPlatformConfigs,
  normalizeHeader,
  validateFile,
} from "../utils/importUtils.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
} from "../utils/commonUtils.js";
import { StatusEnum } from "../enums/enums.js";

export const getSalesStatsByDate = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = normalizeText((req.query.search || "").trim());
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
        { platformOrderId: rawSafeRegex },
        { "product.normalizedName": safeRegex },
        { "product.normalizedVariant": safeRegex },
        { "product.sku": rawSafeRegex },
        { "product.description": rawSafeRegex },
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

// --- Import sales handler ---
export const importSalesByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform || !salesPlatformConfigs[platform]) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    const { sheetName, fields: rawFieldMap } = salesPlatformConfigs[platform];
    const expectedHeaders = Object.values(rawFieldMap).map(normalizeHeader);

    // --- Validate uploaded file ---
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // --- Load workbook ---
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const targetSheetName =
      workbook.SheetNames.find(
        (s) => normalizeHeader(s) === normalizeHeader(sheetName)
      ) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });

    console.log("Expected headers:", expectedHeaders);
    sheetData.slice(0, 6).forEach((row, i) => console.log("Row", i, row));

    // --- Find the header row dynamically ---
    let headerRowIndex = -1;
    let columnIndexMap = {};
    let bestMatchCount = 0;

    for (let r = 0; r < sheetData.length; r++) {
      const row = sheetData[r] || [];
      const headersInRow = {};

      row.forEach((cellValue, colNumber) => {
        if (cellValue) {
          headersInRow[normalizeHeader(cellValue)] = colNumber;
        }
      });

      const matches = expectedHeaders.filter(
        (h) => headersInRow[h] !== undefined
      );

      // pick row with the *most* matching headers
      if (matches.length > bestMatchCount) {
        bestMatchCount = matches.length;
        headerRowIndex = r;
        columnIndexMap = headersInRow;
      }
    }

    if (headerRowIndex === -1 || bestMatchCount === 0) {
      return res.status(400).json({
        message:
          "No valid header row found in the uploaded file. Please check the template.",
      });
    }

    console.log(`Detected header row at index: ${headerRowIndex}`);

    // --- Build final field map ---
    const finalFieldMap = {};
    Object.entries(rawFieldMap).forEach(([key, fieldName]) => {
      const colIndex = columnIndexMap[normalizeHeader(fieldName)];
      if (colIndex !== undefined) {
        finalFieldMap[key] = colIndex;
      }
    });

    // --- Delegate to helper ---
    const results = await processSalesImport({
      sheetData,
      headerRowIndex,
      finalFieldMap,
      platform,
      req,
    });

    res.json({
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

//Process imported sales, mark orders as paid.
export const processSalesImport = async ({
  sheetData,
  headerRowIndex,
  finalFieldMap,
  platform,
  req,
}) => {
  // --- Extract order IDs (start after headerRowIndex automatically) ---
  const rawPlatformOrderIds = sheetData
    .slice(headerRowIndex + 1) // skip header row
    .map((row) =>
      (row?.[finalFieldMap.platformOrderId] || "").toString().trim()
    )
    .filter((id) => id); // keep only non-empty

  if (rawPlatformOrderIds.length === 0) {
    throw new Error("No valid order IDs found in file.");
  }

  // --- Deduplicate IDs while preserving order ---
  const platformOrderIds = [...new Set(rawPlatformOrderIds)];

  // --- Fetch matching orders ---
  const orders = await Order.find({
    platform: platform.toLowerCase(),
    platformOrderId: { $in: platformOrderIds },
  });
  const orderMap = new Map(orders.map((o) => [o.platformOrderId, o]));

  const results = { updated: [], alreadyPaid: [], notFound: [] };

  // --- Process each unique order ---
  for (const platformOrderId of platformOrderIds) {
    const order = orderMap.get(platformOrderId);
    if (!order) {
      results.notFound.push({
        platformOrderId: platformOrderId || "N/A",
        reason: "Order not found",
      });
      continue;
    }

    if (order.isPaid) {
      results.alreadyPaid.push({
        platformOrderId: order.platformOrderId || "N/A",
        reason: "Order is already paid",
      });
      continue;
    }

    const before = { isPaid: order.isPaid };
    order.isPaid = true;
    order.status = StatusEnum.COMPLETED;
    await order.save();

    results.updated.push({
      platformOrderId: order.platformOrderId || "N/A",
      reason: "Order is now paid",
    });

    await logAudit({
      action: "UPDATE",
      user: req.user?._id,
      description: `Marked order ${platformOrderId} as paid via file import (${platform})`,
      collectionName: "Order",
      documentId: order._id,
      before,
      after: { isPaid: true },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }

  return results;
};

