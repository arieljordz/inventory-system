import * as XLSX from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  salesPlatformConfigs,
  returnPlatformConfigs,
  normalizeHeader,
  validateFile,
  detectHeaderRow,
  buildFinalFieldMap,
} from "../utils/importUtils.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
} from "../utils/commonUtils.js";
import { StatusEnum } from "../enums/enums.js";
import { restockItemQuantities } from "../utils/inventoryUtils.js";

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

      // Handle paid/unpaid
      let isPaidFilter;
      if (search.toLowerCase() === "paid") isPaidFilter = true;
      else if (search.toLowerCase() === "unpaid") isPaidFilter = false;

      match.$or = [
        { status: rawSafeRegex },
        { platformOrderId: rawSafeRegex },
        { "product.normalizedName": safeRegex },
        { "product.normalizedVariant": safeRegex },
        { "product.sku": rawSafeRegex },
        { "product.description": rawSafeRegex },
      ];

      if (isPaidFilter !== undefined) {
        match.$or.push({ isPaid: isPaidFilter });
      }
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

// --- Import Sales Handler ---
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
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    // --- Detect header row ---
    let { headerRowIndex, columnIndexMap } = detectHeaderRow(sheetData, expectedHeaders);

    if (headerRowIndex === -1) {
      return res.status(400).json({
        message: "No valid header row found. Check the template.",
      });
    }

    // --- Build final field map ---
    const finalFieldMap = buildFinalFieldMap(rawFieldMap, columnIndexMap);

    // --- Process rows ---
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
        skipped: results.skipped.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Error importing sales:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Process Sales Import with skipped rows ---
export const processSalesImport = async ({
  sheetData,
  headerRowIndex,
  finalFieldMap,
  platform,
  req,
}) => {
  const results = {
    updated: [],
    alreadyPaid: [],
    notFound: [],
    skipped: [],
  };

  const rows = sheetData.slice(headerRowIndex + 1);

  for (const row of rows) {
    if (!row || !row.some((c) => String(c || "").trim())) continue;

    const platformOrderId = (row[finalFieldMap.platformOrderId] || "").toString().trim();

    if (!platformOrderId) {
      results.skipped.push({ reason: "Missing platformOrderId", row });
      continue;
    }

    try {
      const order = await Order.findOne({
        platform: platform.toLowerCase(),
        platformOrderId,
      });

      if (!order) {
        results.notFound.push({ platformOrderId, reason: "Order not found" });
        continue;
      }

      if (order.isPaid) {
        results.alreadyPaid.push({ platformOrderId, reason: "Already paid" });
        continue;
      }

      const before = { isPaid: order.isPaid };
      order.isPaid = true;
      order.status = StatusEnum.COMPLETED;
      await order.save();

      results.updated.push({ platformOrderId, reason: "Order is now paid" });

      await logAudit({
        action: "UPDATE_PAYMENT",
        user: req.user?._id,
        description: `Marked order ${platformOrderId} as paid via file import (${platform})`,
        collectionName: "Order",
        documentId: order._id,
        before,
        after: { isPaid: true },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (err) {
      results.skipped.push({
        platformOrderId,
        reason: `Error processing order: ${err.message}`,
      });
    }
  }

  return results;
};

// --- Import Returns Handler ---
export const importReturnsByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform || !returnPlatformConfigs[platform]) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    const { sheetName, fields: rawFieldMap } = returnPlatformConfigs[platform];
    const expectedHeaders = Object.values(rawFieldMap).map(normalizeHeader);

    // Validate file
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Load workbook
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

    // Detect header row
    let { headerRowIndex, columnIndexMap } = detectHeaderRow(
      sheetData,
      expectedHeaders
    );

    if (headerRowIndex === -1) {
      return res.status(400).json({
        message: "No valid header row found. Check the template.",
      });
    }

    // Build final field map
    const finalFieldMap = buildFinalFieldMap(rawFieldMap, columnIndexMap);

    // Process rows
    const results = await processReturnsImport({
      sheetData,
      headerRowIndex,
      finalFieldMap,
      platform,
      req,
    });

    res.json({
      summary: {
        updated: results.updated.length,
        alreadyReturned: results.alreadyReturned.length,
        notFound: results.notFound.length,
        failedRestocks: results.failedRestocks.length,
        skipped: results.skipped.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Error importing returns:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Process Returns ---
export const processReturnsImport = async ({
  sheetData,
  headerRowIndex,
  finalFieldMap,
  platform,
  req,
}) => {
  const results = {
    updated: [],
    alreadyReturned: [],
    notFound: [],
    failedRestocks: [],
    skipped: [],
  };

  const rows = sheetData.slice(headerRowIndex + 1);

  for (const row of rows) {
    if (!row || !row.some((c) => String(c || "").trim())) continue;

    const platformOrderId = (row[finalFieldMap.platformOrderId] || "")
      .toString()
      .trim();
    if (!platformOrderId) {
      results.skipped.push({ reason: "Missing platformOrderId", row });
      continue;
    }

    try {
      const order = await Order.findOne({
        platform: platform.toLowerCase(),
        platformOrderId,
      });

      if (!order) {
        results.notFound.push({ platformOrderId, reason: "Order not found" });
        continue;
      }

      if (order.status === StatusEnum.RETURNED) {
        results.alreadyReturned.push({
          platformOrderId,
          reason: "Already returned",
        });
        continue;
      }

      const before = order.toObject();
      order.status = StatusEnum.RETURNED;
      await order.save();

      // Restock products
      if (order.products?.length) {
        for (const item of order.products) {
          try {
            await restockItemQuantities(item.product, item.quantity, {
              userId: req.user?._id,
              platformOrderId: order.platformOrderId,
              platform,
              courier: order.courier,
            });
          } catch (err) {
            results.failedRestocks.push({
              platformOrderId: order.platformOrderId,
              productId: item.product,
              quantity: item.quantity,
              reason: err.message,
            });
          }
        }
      }

      results.updated.push({ platformOrderId, reason: "Marked as returned" });

      await logAudit({
        action: "UPDATE_RETURN_STATUS",
        user: req.user?._id,
        description: `Marked order ${platformOrderId} as returned via import (${platform})`,
        collectionName: "Order",
        documentId: order._id,
        before,
        after: { status: StatusEnum.RETURNED },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (err) {
      results.skipped.push({
        platformOrderId,
        reason: `Error processing order: ${err.message}`,
      });
    }
  }

  return results;
};
