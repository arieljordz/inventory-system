import moment from "moment-timezone";
import XLSX from "xlsx";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum, PlatformEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  normalizeString,
  escapeRegex,
  normalizeText,
  parseOrderDate,
} from "../utils/commonUtils.js";
import {
  orderPlatformConfigs,
  normalizeHeader,
  validateFile,
} from "../utils/importUtils.js";
import { updateItemQuantities } from "../utils/inventoryUtils.js";

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
// export const processOrdersImport = async (rows, platform, req) => {
//   const results = { imported: [], skipped: [] };

//   for (const row of rows) {
//     try {
//       const platformOrderId = row.platformOrderId;
//       const name = normalizeText(row.name);
//       const courier = normalizeText(row.courier);
//       const variant = normalizeText(row.variant || "Default");
//       const quantity = parseInt(row.quantity) || 0;
//       const orderDate = parseOrderDate(row.orderDate);

//       if (!platformOrderId || !name || !courier || quantity <= 0) {
//         results.skipped.push({
//           platformOrderId: platformOrderId || "N/A",
//           reason: "Invalid row data",
//         });
//         continue;
//       }

//       const product = await Product.findOne({
//         normalizedName: normalizeString(name),
//         normalizedVariant: normalizeString(variant),
//       });

//       if (!product) {
//         results.skipped.push({ platformOrderId, reason: "Product not found" });
//         continue;
//       }

//       const existingOrder = await Order.findOne({
//         product: product._id,
//         platform,
//         platformOrderId,
//       });
//       if (existingOrder) {
//         results.skipped.push({
//           platformOrderId,
//           reason: "Order already imported",
//         });
//         continue;
//       }

//       if (quantity > product.quantity) {
//         results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
//         continue;
//       }

//       const order = await Order.create({
//         product: product._id,
//         quantity,
//         platform,
//         platformOrderId,
//         courier,
//         orderDate,
//         remarks: "Tagged for pickup - imported orders",
//       });

//       try {
//         // Update item quantities
//         await updateItemQuantities(product, quantity, {
//           userId: req.user?._id,
//           platformOrderId,
//           platform,
//           courier,
//         });
//       } catch (err) {
//         results.skipped.push({
//           platformOrderId,
//           reason: `Stock Item update failed: ${err.message}`,
//         });
//         continue;
//       }

//       const inventoryDetail = await InventoryDetail.create({
//         product: product._id,
//         order: order._id,
//         movementType: "OUT",
//         quantity,
//         courier,
//         platform,
//         status: StatusEnum.ON_PROCESS,
//         remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
//       });

//       // refresh product so it has the latest quantity/status
//       const updatedProduct = await Product.findById(product._id);

//       results.imported.push({
//         platformOrderId,
//         product: updatedProduct,
//         order,
//         inventoryDetail,
//       });

//       await logAudit({
//         action: "IMPORT_ORDER",
//         user: req.user?._id || null,
//         description: `Imported order from ${platform} with Order ID: ${platformOrderId}`,
//         collectionName: "Order",
//         documentId: order._id,
//         before: null,
//         after: { order, inventoryDetail, product: updatedProduct },
//         ip: req.ip,
//         userAgent: req.headers["user-agent"],
//       });
//     } catch (err) {
//       results.skipped.push({
//         platformOrderId: row.platformOrderId || "N/A",
//         reason: `Error: ${err.message}`,
//       });
//     }
//   }

//   return {
//     summary: {
//       imported: results.imported.length,
//       skipped: results.skipped.length,
//     },
//     details: results,
//   };
// };

// --- Modular row processor (platform-agnostic) ---
export const processOrdersImport = async (rows, platform, req) => {
  const results = { imported: [], skipped: [] };

  for (const row of rows) {
    try {
      const platformOrderId = row.platformOrderId;
      const name = normalizeText(row.name);
      const courier = normalizeText(row.courier);
      const variant = normalizeText(row.variant || "Default");
      const quantity = parseInt(row.quantity) || 0;
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

      // 🔹 Check if order already exists
      const existingOrder = await Order.findOne({
        product: product._id,
        platform,
        platformOrderId,
      });

      if (existingOrder) {
        // --- Re-import case ---
        const oldQty = existingOrder.quantity;
        const qtyDiff = quantity - oldQty;

        if (qtyDiff === 0) {
          results.skipped.push({
            platformOrderId,
            reason: "Order already imported, No change in quantity",
          });
          continue;
        }

        if (qtyDiff > 0 && qtyDiff > product.quantity) {
          results.skipped.push({
            platformOrderId,
            reason: "Insufficient stock for adjustment",
          });
          continue;
        }

        try {
          // Adjust stock (positive = take more stock, negative = return stock)
          await updateItemQuantities(product, qtyDiff, {
            userId: req.user?._id,
            platformOrderId,
            platform,
            courier,
          });

          // Update order
          existingOrder.quantity = quantity;
          await existingOrder.save();

          // Update inventory detail
          const inventoryDetail = await InventoryDetail.findOne({
            order: existingOrder._id,
          });
          if (inventoryDetail) {
            inventoryDetail.quantity = quantity;
            inventoryDetail.remarks = `Adjusted order - Order ID: ${platformOrderId}`;
            await inventoryDetail.save();
          }

          // Refresh product
          const updatedProduct = await Product.findById(product._id);

          results.imported.push({
            platformOrderId,
            product: updatedProduct,
            order: existingOrder,
            inventoryDetail,
            adjustment: true,
          });

          await logAudit({
            action: "REIMPORT_ORDER",
            user: req.user?._id || null,
            description: `Adjusted imported order from ${platform} with Order ID: ${platformOrderId}`,
            collectionName: "Order",
            documentId: existingOrder._id,
            before: { oldQuantity: oldQty },
            after: { newQuantity: quantity },
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          });

          continue; // ✅ skip "create new" flow
        } catch (err) {
          results.skipped.push({
            platformOrderId,
            reason: `Re-import failed: ${err.message}`,
          });
          continue;
        }
      }

      // --- New order flow ---
      if (quantity > product.quantity) {
        results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
        continue;
      }

      const order = await Order.create({
        product: product._id,
        quantity,
        platform,
        platformOrderId,
        courier,
        orderDate,
        remarks: "Tagged for pickup - imported orders",
      });

      try {
        await updateItemQuantities(product, quantity, {
          userId: req.user?._id,
          platformOrderId,
          platform,
          courier,
        });
      } catch (err) {
        results.skipped.push({
          platformOrderId,
          reason: `Stock Item update failed: ${err.message}`,
        });
        continue;
      }

      const inventoryDetail = await InventoryDetail.create({
        product: product._id,
        order: order._id,
        movementType: "OUT",
        quantity,
        courier,
        platform,
        status: StatusEnum.ON_PROCESS,
        remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
      });

      const updatedProduct = await Product.findById(product._id);

      results.imported.push({
        platformOrderId,
        product: updatedProduct,
        order: existingOrder || order, // use whichever exists
        inventoryDetail,
        adjustment: !!existingOrder,
        reason: existingOrder
          ? "Imported Order, quantity updated"
          : "Imported Order",
      });

      await logAudit({
        action: existingOrder ? "REIMPORT_ORDER" : "IMPORT_ORDER",
        user: req.user?._id || null,
        description: existingOrder
          ? `Adjusted imported order from ${platform} with Order ID: ${platformOrderId}`
          : `Imported order from ${platform} with Order ID: ${platformOrderId}`,
        collectionName: "Order",
        documentId: (existingOrder || order)._id,
        before: existingOrder ? { oldQuantity: oldQty } : null,
        after: existingOrder
          ? { newQuantity: quantity }
          : { order, inventoryDetail, product: updatedProduct },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
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
    // 🔹 Determine start and end of current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Sept 1, 2025
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ); // Sept 30, 2025 23:59:59

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
    console.error("Error fetching monthly order stats:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
