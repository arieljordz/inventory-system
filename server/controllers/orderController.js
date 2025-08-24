import moment from "moment-timezone";
import ExcelJS from "exceljs";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
} from "../utils/commonUtils.js";
import { getPlatformMappings, validateFile } from "../utils/importUtils.js";

export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = normalizeText((req.query.search || "").trim());

    const normalizedSearch = normalizeString(search);
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    const skip = (page - 1) * limit;

    // Build search query
    const match = search
      ? {
          $or: [
            { status: rawSafeRegex },
            { platformOrderId: rawSafeRegex },
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
      { $sort: { createdAt: -1 } },
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

export const importOrdersByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform) return res.status(400).json({ message: "Platform is required" });

    // --- Get platform mapping ---
    let mapping;
    try {
      mapping = getPlatformMappings(platform, "order");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    console.log("✅ Using mapping:", platform, mapping);

    // --- Validate uploaded file ---
    try {
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // --- Load workbook ---
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    console.log("📋 Available sheets:", workbook.worksheets.map(s => s.name));

    // --- Find target sheet ---
    const targetSheet = workbook.worksheets.find(
      sheet => sheet.name.trim().toLowerCase() === mapping.sheetName.toLowerCase()
    );
    if (!targetSheet) return res.status(400).json({ message: `Sheet "${mapping.sheetName}" not found` });
    console.log(`📄 Using sheet: "${targetSheet.name}" with ${targetSheet.rowCount} rows`);

    // --- Dynamic header detection ---
    const expectedHeaders = Object.values(mapping.fields).map(h => h.toLowerCase());
    let headerRowIndex = 0;
    let columnIndexMap = {};

    for (let r = 1; r <= targetSheet.rowCount; r++) {
      const row = targetSheet.getRow(r);
      const headersInRow = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.value) headersInRow[String(cell.value).trim().toLowerCase()] = colNumber;
      });

      // Partial match: at least 2 expected headers must match
      const matches = expectedHeaders.filter(h =>
        Object.keys(headersInRow).some(cellHeader => cellHeader === h || cellHeader.includes(h) || h.includes(cellHeader))
      );

      if (matches.length >= 2) {
        headerRowIndex = r;
        columnIndexMap = headersInRow;
        console.log(`✅ Header row detected at row ${r}:`, headersInRow);
        break;
      }
    }

    if (!headerRowIndex) {
      console.warn("⚠️ No header row detected, defaulting to row 1");
      headerRowIndex = 1;
      targetSheet.getRow(headerRowIndex).eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.value) columnIndexMap[String(cell.value).trim().toLowerCase()] = colNumber;
      });
    }

    // --- Build field map for processOrderRows ---
    const fieldMap = {};
    Object.entries(mapping.fields).forEach(([fieldKey, header]) => {
      const normalizedHeader = header.trim().toLowerCase();
      const colIndex = columnIndexMap[normalizedHeader];
      if (colIndex) fieldMap[fieldKey] = colIndex;
    });

    const missingFields = Object.keys(mapping.fields).filter(f => !fieldMap[f]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingFields.join(", ")}. Available headers: ${Object.keys(columnIndexMap).join(", ")}`,
      });
    }

    // --- Extract rows data ---
    const rows = [];
    const startRow = headerRowIndex + 1;

    for (let r = startRow; r <= targetSheet.rowCount; r++) {
      const row = targetSheet.getRow(r);
      if (!row || row.cellCount === 0) continue;

      let hasData = false;
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (String(cell.value || "").trim()) hasData = true;
      });
      if (!hasData) continue;

      const rowData = {};
      Object.entries(fieldMap).forEach(([fieldKey, colIndex]) => {
        rowData[fieldKey] = row.getCell(colIndex)?.text?.trim() || "";
      });

      rows.push(rowData);
    }

    console.log(`🚀 Processing ${rows.length} rows`);

    // --- Process rows modularly ---
    const processResults = await processOrderRows(rows, fieldMap, platform, req);

    res.status(201).json(processResults);

  } catch (error) {
    console.error("🔥 Import error:", error);
    res.status(500).json({ message: error.message || "Failed to import orders" });
  }
};

// --- Modular row processor ---
const processOrderRows = async (rows, fieldMap, platform, req) => {
  const results = { imported: [], skipped: [] };

  for (const row of rows) {
    try {
      const platformOrderId = row.platformOrderId?.toString().trim();
      const name = normalizeText(row.name?.trim() || "");
      const courier = normalizeText(row.courier?.trim() || "");
      let variant = normalizeText(row.variant?.trim() || "Default");
      const quantity = parseInt(row.quantity) || 0;

      if (!platformOrderId || !name || !courier || quantity <= 0) {
        results.skipped.push({ platformOrderId: platformOrderId || "N/A", reason: "Invalid row data" });
        continue;
      }

      const product = await Product.findOne({
        normalizedName: normalizeString(name),
        normalizedVariant: normalizeString(variant),
      });
      if (!product) { results.skipped.push({ platformOrderId, reason: "Product not found" }); continue; }

      const existingOrder = await Order.findOne({ product: product._id, platformOrderId, platform });
      if (existingOrder) { results.skipped.push({ platformOrderId, reason: "Order already imported" }); continue; }

      if (quantity > product.quantity) { results.skipped.push({ platformOrderId, reason: "Insufficient stock" }); continue; }

      const order = await Order.create({
        product: product._id, quantity, platform, platformOrderId, courier,
        remarks: "Tagged for pickup - imported orders",
      });

      const remainingQty = product.quantity - quantity;
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { quantity: remainingQty, ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }) },
        { new: true }
      );

      const inventoryDetail = await InventoryDetail.create({
        product: product._id, order: order._id, movementType: "OUT", quantity,
        courier, platform, status: StatusEnum.FOR_PICK_UP,
        remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
      });

      results.imported.push({ platformOrderId, reason: "Order imported successfully", product: updatedProduct, order, inventoryDetail });

      await logAudit({
        action: "IMPORT_ORDER",
        user: req.user?._id || null,
        description: `Imported order from ${platform} with Order ID: ${platformOrderId}`,
        collectionName: "Order",
        documentId: order._id,
        before: null,
        after: { order, inventoryDetail, product: updatedProduct },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

    } catch (err) {
      console.error(`❌ Error processing row:`, err);
      results.skipped.push({ platformOrderId: row.platformOrderId || "N/A", reason: `Error: ${err.message}` });
    }
  }

  return {
    message: "Order import completed",
    summary: { imported: results.imported.length, skipped: results.skipped.length },
    details: results,
  };
};
