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
  processOrderRows,
  extractOrderIds,
} from "../utils/importUtils.js";

export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);
    const search = (req.query.search || "").trim();

    const skip = (page - 1) * limit;

    // Build search match
    const match = search
      ? {
          $or: [
            { status: { $regex: search, $options: "i" } },
            { "product.name": { $regex: search, $options: "i" } },
            { "product.description": { $regex: search, $options: "i" } },
            { "product.sku": { $regex: search, $options: "i" } },
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
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    // Validate platform and get mapping
    let mapping;
    try {
      mapping = getPlatformMappings(platform, "order");
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Step 1: Validate file
    validateFile(req.file);

    // Step 2: Read rows (with auto header detection)
    const rows = getSheetRows(
      req.file,
      mapping.sheetName,
      Object.values(mapping.fields)
    );

    // Step 3: Process rows
    const results = await processOrderRows(rows, mapping.fields, platform, req);

    // Step 4: Send response
    res.status(201).json(results);
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      message: error.message || "Failed to import orders",
    });
  }
};

