import path from "path";
import xlsx from "xlsx";
import moment from "moment-timezone";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  getPlatformMappings,
  validateFile,
  getSheetRows,
  extractOrderIds,
} from "../utils/importUtils.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("product", "name sku price image description") // Select only key fields
      .sort({ createdAt: -1 }); // Latest orders first

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
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
    // Step 1: Validate platform presence
    const platform = req.body.platform;
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    // Step 2: Get field mappings for the platform
    let mapping;

    try {
      mapping = getPlatformMappings(platform, "order");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { sheetName, fields: fieldMap } = mapping;

    try {
      // Step 3: Validate file format and buffer
      validateFile(req.file);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Step 4: Read and parse sheet rows from the uploaded file
    let rows;
    try {
      rows = getSheetRows(req.file, sheetName);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const results = {
      imported: [],
      skipped: [],
    };

    // Step 5: Loop through each row and process
    for (const row of rows) {
      const platformOrderId = row[fieldMap.platformOrderId]?.toString().trim();
      const name = row[fieldMap.name]?.trim();
      const courier = row[fieldMap.courier]?.trim();
      const variant = row[fieldMap.variant]?.trim() || "";
      const quantity = parseInt(row[fieldMap.quantity]) || 0;

      // Validate required fields
      if (!platformOrderId || !name || !courier || quantity <= 0) {
        results.skipped.push({
          platformOrderId: platformOrderId || "N/A",
          reason: "Invalid row data",
        });
        continue;
      }

      // Skip if order already exists
      const existingOrder = await Order.findOne({ platformOrderId });
      if (existingOrder) {
        results.skipped.push({
          platformOrderId,
          reason: "Order already exists",
        });
        continue;
      }

      // Fetch product by name and variant
      const product = await Product.findOne({ name, variant });
      if (!product) {
        results.skipped.push({ platformOrderId, reason: "Product not found" });
        continue;
      }

      // Check for sufficient stock
      if (quantity > product.quantity) {
        results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
        continue;
      }

      // Create new order
      const order = await Order.create({
        product: product._id,
        quantity,
        platform,
        platformOrderId,
        courier,
        remarks: "Tagged for pickup - imported orders",
      });

      // Update product stock
      const remainingQty = product.quantity - quantity;
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          quantity: remainingQty,
          ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
        },
        { new: true }
      );

      // Create inventory detail entry
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

      results.imported.push({
        product: updatedProduct,
        order,
        inventoryDetail,
      });

      // Log audit
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
    }

    // Final response
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
    res.status(500).json({ message: "Failed to import orders" });
  }
};
