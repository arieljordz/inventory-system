import moment from "moment-timezone";
import XLSX from "xlsx";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { PlatformEnum } from "../enums/enums.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
  parseOrderDate,
  normalizeHeader,
  validateFile,
} from "../utils/commonUtils.js";
import {
  orderPlatformConfigs,
  handleReimportOrder,
  handleNewOrder,
} from "../utils/importOrdersUtils.js";
import { getEffectivePriceStage } from "../utils/reportUtils.js";

export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = normalizeText((req.query.search || "").trim());

    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    const skip = (page - 1) * limit;

    const priceMode = "productFirst"; // or "orderFirst"

    // Build search query
    const match = search
      ? {
          $or: [
            { status: rawSafeRegex },
            { platformOrderId: rawSafeRegex },
            { orderNumber: rawSafeRegex },
            { "product.normalizedName": safeRegex },
            { "product.normalizedVariant": safeRegex },
            { "product.sku": rawSafeRegex },
            { "product.description": rawSafeRegex },
          ],
        }
      : {};

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

      // 🔹 Inject effectivePrice stage
      getEffectivePriceStage(priceMode),

      { $sort: { orderDate: -1 } },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          platform: 1,
          platformOrderId: 1,
          quantity: 1,
          status: 1,
          isPaid: 1,
          orderDate: 1,
          // flatten product fields
          productId: "$product._id",
          productName: "$product.name",
          productSku: "$product.sku",
          productVariant: "$product.normalizedVariant",
          productDescription: "$product.description",
          price: "$effectivePrice", // 🔹 use computed price
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const orders = result[0].data;
    const totalOrders = result[0].total[0]?.count || 0;

    res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.max(Math.ceil(totalOrders / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrdersByDate = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("product", "name sku price image description")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// --- Import handler ---
export const importOrdersByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform || !orderPlatformConfigs[platform])
      return res.status(400).json({ message: "Invalid platform" });

    const { fieldMap: rawFieldMap, sheetName } = orderPlatformConfigs[platform];
    const expectedHeaders = Object.values(rawFieldMap).map(normalizeHeader);

    // Validate file
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Load workbook
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const targetSheetName = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });

    // --- Detect header row dynamically ---
    let headerRowIndex = -1;
    let columnIndexMap = {};
    let bestMatchCount = 0;

    for (let r = 0; r < sheetData.length; r++) {
      const row = sheetData[r] || [];
      const headersInRow = {};
      row.forEach((cellValue, colNumber) => {
        if (cellValue) headersInRow[normalizeHeader(cellValue)] = colNumber;
      });

      const matches = expectedHeaders.filter(
        (h) => headersInRow[h] !== undefined
      );

      if (matches.length > bestMatchCount) {
        bestMatchCount = matches.length;
        headerRowIndex = r;
        columnIndexMap = headersInRow;
      }
    }

    if (headerRowIndex === -1) headerRowIndex = 0; // fallback

    // Build final field map (header name -> column index)
    const finalFieldMap = {};
    Object.entries(rawFieldMap).forEach(([key, headerName]) => {
      const colIndex = columnIndexMap[normalizeHeader(headerName)];
      if (colIndex !== undefined) finalFieldMap[key] = colIndex;
    });

    // Check missing fields
    const missingFields = Object.keys(rawFieldMap).filter(
      (k) => !(k in finalFieldMap)
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingFields.join(", ")}`,
      });
    }

    // Extract rows
    const rows = [];
    for (let r = headerRowIndex + 1; r < sheetData.length; r++) {
      const row = sheetData[r];
      if (!row || !row.some((cell) => String(cell || "").trim())) continue;

      const rowData = {};
      Object.entries(finalFieldMap).forEach(([key, colIndex]) => {
        rowData[key] = (row[colIndex] || "").toString().trim();
      });
      rows.push(rowData);
    }

    console.log(`🚀 Processing ${rows.length} rows for ${platform}`);

    const processResults = await processOrdersImport(rows, platform, req);
    res.status(201).json(processResults);
  } catch (error) {
    console.error("🔥 Import error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to import orders" });
  }
};

// --- Modular row processor (platform-agnostic) ---
export const processOrdersImport = async (rows, platform, req) => {
  const results = { imported: [], skipped: [] };

  for (const row of rows) {
    try {
      const platformOrderId = row.platformOrderId;
      const orderNumber = row.orderNumber;
      const name = normalizeText(row.name);
      const courier = normalizeText(row.courier);
      const variant = normalizeText(row.variant || "Default");
      const quantity = parseInt(row.quantity) || 0;
      const price = parseFloat(row.price) || 0;
      const orderDate = parseOrderDate(row.orderDate);

      if (!platformOrderId || !name || !courier || quantity <= 0) {
        results.skipped.push({
          platformOrderId: platformOrderId || "N/A",
          reason: "Invalid row data",
        });
        continue;
      }

      const product = await Product.findOne({
        normalizedName: normalizeString(name),
        normalizedVariant: normalizeString(variant),
      });

      if (!product) {
        results.skipped.push({ platformOrderId, reason: "Product not found" });
        continue;
      }

      const existingOrder = await Order.findOne({
        product: product._id,
        platform,
        platformOrderId,
      });
      // --- Re-import order case ---
      if (existingOrder) {
        const reimportResult = await handleReimportOrder({
          existingOrder,
          product,
          quantity,
          price,
          platform,
          platformOrderId,
          orderNumber,
          courier,
          req,
        });

        results[reimportResult.type].push(reimportResult.data);
        continue;
      }

      // --- New order case ---
      const newOrderResult = await handleNewOrder({
        product,
        quantity,
        price,
        platform,
        platformOrderId,
        orderNumber,
        courier,
        orderDate,
        req,
      });

      results[newOrderResult.type].push(newOrderResult.data);
    } catch (err) {
      results.skipped.push({
        platformOrderId: row.platformOrderId || "N/A",
        reason: `Error: ${err.message}`,
      });
    }
  }

  return {
    summary: {
      imported: results.imported.length,
      skipped: results.skipped.length,
    },
    details: results,
  };
};

export const getOrderStatsByPlatform = async (req, res) => {
  try {
    const timezone = "Asia/Manila"; // adjust if needed

    // 🔹 Start & end of current month
    const startDate = moment().tz(timezone).startOf("month").toDate();
    const endDate = moment().tz(timezone).endOf("month").toDate();

    // 🔹 Aggregate counts grouped by platform, filtered by current month
    const counts = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$platform",
          total: { $sum: 1 },
        },
      },
    ]);

    // 🔹 Format results into a stats object
    const stats = {
      overall: 0,
      shopee: 0,
      tiktok: 0,
      lazada: 0,
    };

    counts.forEach((entry) => {
      const platform = entry._id?.toLowerCase();
      stats.overall += entry.total;

      if (platform === PlatformEnum.SHOPEE.toLowerCase())
        stats.shopee = entry.total;
      if (platform === PlatformEnum.TIKTOK.toLowerCase())
        stats.tiktok = entry.total;
      if (platform === PlatformEnum.LAZADA.toLowerCase())
        stats.lazada = entry.total;
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching monthly order stats:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
