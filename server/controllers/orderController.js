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
import {
  getPlatformMappings,
  validateFile,
  getSheetRows,
  processOrderRows,
} from "../utils/importUtils.js";

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

// export const importOrdersByPlatform = async (req, res) => {
//   try {
//     const platform = (req.body.platform || "").toLowerCase();
//     if (!platform) {
//       return res.status(400).json({ message: "Platform is required" });
//     }

//     // Validate platform and get mapping
//     let mapping;
//     try {
//       mapping = getPlatformMappings(platform, "order");
//     } catch (err) {
//       return res.status(400).json({ message: err.message });
//     }

//     // Step 1: Validate file
//     validateFile(req.file);

//     // Step 2: Read rows (with auto header detection)
//     const rows = getSheetRows(
//       req.file,
//       mapping.sheetName,
//       Object.values(mapping.fields)
//     );

//     // Step 3: Process rows
//     const results = await processOrderRows(rows, mapping.fields, platform, req);

//     // Step 4: Send response
//     res.status(201).json(results);
//   } catch (error) {
//     console.error("Import error:", error);
//     res.status(500).json({
//       message: error.message || "Failed to import orders",
//     });
//   }
// };

export const importOrdersByPlatform = async (req, res) => {
  try {
    const platform = (req.body.platform || "").toLowerCase();
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    // Get mapping for platform
    let mapping;
    try {
      mapping = getPlatformMappings(platform, "order");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Validate uploaded file
    validateFile(req.file);

    // Load Excel workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const targetSheet = workbook.worksheets.find(
      (sheet) =>
        sheet.name.trim().toLowerCase() === mapping.sheetName.toLowerCase()
    );
    if (!targetSheet) {
      return res
        .status(400)
        .json({ message: `Sheet "${mapping.sheetName}" not found` });
    }

    // Determine header row index based on platform
    let headerRowIndex = 1;
    if (platform === "tiktok") headerRowIndex = 3; // skip 2 rows
    else if (["shopee", "lazada"].includes(platform)) headerRowIndex = 2; // skip 1 row

    const headerRow = targetSheet.getRow(headerRowIndex);
    const headers = headerRow.values
      .slice(1)
      .map((h) => String(h || "").trim());

    // Map expected fields to actual column indexes
    const columnMap = {};
    Object.entries(mapping.fields).forEach(([key, fieldName]) => {
      const idx = headers.findIndex(
        (h) => h.toLowerCase() === fieldName.toLowerCase()
      );
      if (idx >= 0) columnMap[key] = idx + 1;
    });

    const results = { imported: [], skipped: [] };

    // Process rows starting after header
    targetSheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber < headerRowIndex + 1) return; // skip header rows

      try {
        const platformOrderId = row
          .getCell(columnMap.platformOrderId)
          ?.text?.trim();
        const name = normalizeText(
          row.getCell(columnMap.name)?.text?.trim() || ""
        );
        const courier = normalizeText(
          row.getCell(columnMap.courier)?.text?.trim() || ""
        );
        let variant = normalizeText(
          row.getCell(columnMap.variant)?.text?.trim() || "Default"
        );
        const quantity = parseInt(row.getCell(columnMap.quantity)?.text) || 0;

        // Validation
        if (!platformOrderId || !name || !courier || quantity <= 0) {
          results.skipped.push({
            platformOrderId: platformOrderId || "N/A",
            reason: "Invalid row data",
          });
          return;
        }

        // Find product
        const product = await Product.findOne({
          normalizedName: normalizeString(name),
          normalizedVariant: normalizeString(variant),
        });

        if (!product) {
          results.skipped.push({
            platformOrderId,
            reason: "Product not found",
          });
          return;
        }

        // Check duplicate order
        const existingOrder = await Order.findOne({
          product: product._id,
          platformOrderId,
          platform,
        });

        if (existingOrder) {
          results.skipped.push({
            platformOrderId,
            reason: "Order already imported",
          });
          return;
        }

        if (quantity > product.quantity) {
          results.skipped.push({
            platformOrderId,
            reason: "Insufficient stock",
          });
          return;
        }

        // Create order
        const order = await Order.create({
          product: product._id,
          quantity,
          platform,
          platformOrderId,
          courier,
          remarks: "Tagged for pickup - imported orders",
        });

        const remainingQty = product.quantity - quantity;
        const updatedProduct = await Product.findByIdAndUpdate(
          product._id,
          {
            quantity: remainingQty,
            ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
          },
          { new: true }
        );

        // Inventory detail
        const inventoryDetail = await InventoryDetail.create({
          product: product._id,
          order: order._id,
          movementType: "OUT",
          quantity,
          courier,
          platform,
          status: StatusEnum.FOR_PICK_UP,
          remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
        });

        // Audit log
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

        results.imported.push({
          platformOrderId,
          reason: "Order imported successfully",
          order,
          product: updatedProduct,
          inventoryDetail,
        });
      } catch (err) {
        results.skipped.push({
          platformOrderId:
            row.getCell(columnMap.platformOrderId)?.text || "N/A",
          reason: `Error processing row: ${err.message}`,
        });
      }
    });

    res.status(201).json({
      message: "Order import completed",
      summary: {
        imported: results.imported.length,
        skipped: results.skipped.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Import error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to import orders" });
  }
};
