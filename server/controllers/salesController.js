import * as XLSX from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import { returnPlatformConfigs } from "../utils/importReturnsUtils.js";
import { salesPlatformConfigs } from "../utils/importSalesUtils.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
  normalizeHeader,
  validateFile,
  detectHeaderRow,
  buildFinalFieldMap,
} from "../utils/commonUtils.js";
import { StatusEnum } from "../enums/enums.js";
import { restockItemQuantities } from "../utils/itemQuantityUtils.js";

export const getSalesStats = async (req, res) => {
  try {
    const timezone = "Asia/Manila"; // adjust if needed

    // 🔹 Start & end of current month using moment
    const startDate = moment().tz(timezone).startOf("month").toDate();
    const endDate = moment().tz(timezone).endOf("month").toDate();

    const result = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate }, // ✅ only current month
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

      // 🔹 Compute effectivePrice: use order.price if exists, else product.price
      {
        $addFields: {
          effectivePrice: {
            $cond: {
              if: { $ifNull: ["$price", false] }, // check if order.price exists
              then: "$price",
              else: "$product.price",
            },
          },
        },
      },

      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: { $multiply: ["$quantity", "$effectivePrice"] } },
          unpaidOrders: {
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = result[0] || {
      totalOrders: 0,
      totalSales: 0,
      unpaidOrders: 0,
      paidOrders: 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("❌ Error fetching sales stats:", error);
    res.status(500).json({ message: "Failed to fetch sales stats" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = normalizeText((req.query.search || "").trim());
    const skip = (page - 1) * limit;

    // Base filter
    let match = {};

    // Search filter
    if (search) {
      const normalizedSearch = normalizeString(search);
      const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
      const rawSafeRegex = new RegExp(escapeRegex(search), "i");

      let isPaidFilter;
      if (search.toLowerCase() === "paid") isPaidFilter = true;
      else if (search.toLowerCase() === "unpaid") isPaidFilter = false;

      match.$or = [
        { status: rawSafeRegex },
        { platformOrderId: rawSafeRegex },
        { orderNumber: rawSafeRegex },
        { "product.normalizedName": safeRegex },
        { "product.normalizedVariant": safeRegex },
        { "product.sku": rawSafeRegex },
        { "product.description": rawSafeRegex },
      ];

      if (isPaidFilter !== undefined) match.$or.push({ isPaid: isPaidFilter });
    }

    // Fetch paginated orders
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
      { $sort: { orderDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const orders = await Order.aggregate(pipeline);

    // Total orders for pagination
    const totalOrders = await Order.countDocuments(match);

    res.json({
      orders,
      totalOrders,
      totalPages: Math.max(Math.ceil(totalOrders / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const importSalesByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform || !salesPlatformConfigs[platform]) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    const {
      sheetName,
      fields: rawFieldMap,
      requiredHeaders,
    } = salesPlatformConfigs[platform];
    const expectedHeaders = Object.values(rawFieldMap).map(normalizeHeader);

    // --- Validate uploaded file ---
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // --- Load workbook ---
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    // ✅ Strict sheet validation (no fallback)
    const targetSheetName = workbook.SheetNames.find(
      (s) => normalizeHeader(s) === normalizeHeader(sheetName)
    );

    if (!targetSheetName) {
      return res.status(400).json({
        message: `Invalid file. Expected sheet "${sheetName}" for ${platform} sales import.`,
      });
    }

    const worksheet = workbook.Sheets[targetSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });

    // --- Detect header row ---
    let { headerRowIndex, columnIndexMap } = detectHeaderRow(
      sheetData,
      expectedHeaders
    );

    if (headerRowIndex === -1) {
      return res.status(400).json({
        message: "No valid header row found. Check the template.",
      });
    }

    // ✅ Validate required headers
    const fileHeaders = sheetData[headerRowIndex].map(normalizeHeader);
    const missingHeaders = requiredHeaders.filter(
      (reqHeader) => !fileHeaders.includes(normalizeHeader(reqHeader))
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `Missing required headers: ${missingHeaders.join(", ")}.`,
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

// --- Process Sales Import ---
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
    duplicates: [],
  };

  const rows = sheetData.slice(headerRowIndex + 1);
  const seenOrderIds = new Set();

  for (const row of rows) {
    // Skip empty rows
    if (!row || !row.some((c) => String(c || "").trim())) continue;

    const platformOrderId = (row[finalFieldMap.platformOrderId] || "")
      .toString()
      .trim();

    const orderNumber = (row[finalFieldMap.orderNumber] || "")
      .toString()
      .trim();

    // --- Validation ---
    if (!platformOrderId) {
      results.skipped.push({ reason: "Missing platformOrderId", row });
      continue;
    }

    if (seenOrderIds.has(platformOrderId)) {
      results.duplicates.push({
        platformOrderId,
        reason: "Duplicate in uploaded file",
      });
      continue;
    }
    seenOrderIds.add(platformOrderId);

    try {
      // console.log("Looking for:", { platform, platformOrderId });
      // --- Find order in DB ---
      const order = await Order.findOne({
        platform: platform.toLowerCase(),
        platformOrderId,
      });

      if (!order) {
        results.notFound.push({
          platformOrderId,
          reason: "Order not found",
        });
        continue;
      }

      if (order.isPaid) {
        results.alreadyPaid.push({
          platformOrderId,
          reason: "Order already marked as paid",
        });
        continue;
      }

      // --- Update order ---
      const before = { isPaid: order.isPaid };
      order.isPaid = true;
      order.orderNumber = orderNumber || order.orderNumber; // fallback if blank
      order.status = StatusEnum.COMPLETED;

      await order.save();

      results.updated.push({
        platformOrderId,
        reason: "Order marked as paid",
      });

      // --- Log audit ---
      await logAudit({
        action: "UPDATE_PAYMENT",
        user: req.user?._id,
        description: `Marked order as paid from ${platform} (ID: ${platformOrderId})`,
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
        reason: `Error: ${err.message}`,
      });
    }
  }
  // console.log("results:", results);
  return results;
};

// --- Import Returns ---
export const importReturnsByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    const config = returnPlatformConfigs[platform];

    if (!platform || !config) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    const { sheetName, fields: rawFieldMap, requiredHeaders = [] } = config;
    const expectedHeaders = Object.values(rawFieldMap).map(normalizeHeader);

    // --- Validate uploaded file ---
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // --- Load workbook & sheet ---
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const targetSheetName = workbook.SheetNames.find(
      (s) => normalizeHeader(s) === normalizeHeader(sheetName)
    );

    if (!targetSheetName) {
      return res.status(400).json({
        message: `Invalid file. Expected sheet "${sheetName}" for ${platform} returns import.`,
      });
    }

    const worksheet = workbook.Sheets[targetSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });

    // --- Detect header row ---
    const { headerRowIndex, columnIndexMap } = detectHeaderRow(
      sheetData,
      expectedHeaders
    );
    if (headerRowIndex === -1) {
      return res.status(400).json({
        message: "No valid header row found. Check the template.",
      });
    }

    // --- Check required headers ---
    const normalizedHeaders = sheetData[headerRowIndex].map(normalizeHeader);
    const missingHeaders = requiredHeaders
      .map(normalizeHeader)
      .filter((h) => !normalizedHeaders.includes(h));

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `Invalid file. Missing required headers: ${missingHeaders.join(
          ", "
        )}.`,
      });
    }

    // --- Build final field map ---
    const finalFieldMap = buildFinalFieldMap(rawFieldMap, columnIndexMap);

    // --- Process import ---
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
        duplicates: results.duplicates.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Error importing returns:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- Process Returns Import ---
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
    duplicates: [],
  };

  const rows = sheetData.slice(headerRowIndex + 1);
  const seenOrderIds = new Set();

  for (const row of rows) {
    // Skip empty rows
    if (!row || !row.some((c) => String(c || "").trim())) continue;

    const platformOrderId = (row[finalFieldMap.platformOrderId] || "")
      .toString()
      .trim();
    if (!platformOrderId) {
      results.skipped.push({ reason: "Missing platformOrderId", row });
      continue;
    }

    // Prevent duplicate processing within the file
    if (seenOrderIds.has(platformOrderId)) {
      results.duplicates.push({
        platformOrderId,
        reason: "Duplicate in uploaded file",
      });
      continue;
    }
    seenOrderIds.add(platformOrderId);

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
          reason: "Order already marked as returned",
        });
        continue;
      }

      // --- Update order status ---
      const before = order.toObject();
      order.status = StatusEnum.RETURNED;
      order.isPaid = false;
      await order.save();

      // --- Restock products ---
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

      results.updated.push({
        platformOrderId,
        reason: "Order marked as returned and restocked",
      });

      // --- Log audit ---
      await logAudit({
        action: "UPDATE_RETURN_STATUS",
        user: req.user?._id,
        description: `Marked order as returned from ${platform} (ID: ${platformOrderId})`,
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
