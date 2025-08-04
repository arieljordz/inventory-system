
import mongoose from "mongoose";
import path from "path";
import xlsx from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";
import Product from "../models/Product.js"; 

export const importSalesByPlatform = async (req, res) => {
  try {
    const platform = req.body.platform;

    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const ext = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace(".", ""); // get "csv", "xlsx", etc.

    let rows = [];

    if (ext === "csv" || ["xlsx", "xls"].includes(ext)) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet =
        workbook.Sheets["income"] || workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        return res
          .status(400)
          .json({ message: "No readable sheet found in file." });
      }

      rows = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res
        .status(400)
        .json({
          message:
            "Unsupported file format. Please upload .csv, .xlsx, or .xls files.",
        });
    }

    const excelOrderIds = rows
      .map((row) => String(row["Order ID"]).trim())
      .filter((id) => id);

    if (excelOrderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid order IDs found in file." });
    }

    const orders = await Order.find({
      platform,
      platformOrderId: { $in: excelOrderIds },
    });

    const updatedOrders = [];

    for (const order of orders) {
      if (!order.isPaid) {
        order.isPaid = true;
        await order.save();
        updatedOrders.push(order._id);
      }
    }

    res.json({
      message: `${updatedOrders.length} orders marked as paid.`,
      updatedOrderIds: updatedOrders,
    });
  } catch (error) {
    console.error("Error checking sales from file:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSalesStatsByDate = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = moment.tz(start, "Asia/Manila").startOf("day").toDate();
    const endDate = moment.tz(end, "Asia/Manila").endOf("day").toDate();

    const todayStart = moment.tz("Asia/Manila").startOf("day").toDate();
    const todayEnd = moment.tz("Asia/Manila").endOf("day").toDate();

    // 1. Get all orders in the given date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("product", "price");

    // 2. Get today's orders only for revenue
    const todaysOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).populate("product", "price");

    let totalSales = 0;
    let unpaidOrders = 0;
    let revenue = 0;

    for (const order of orders) {
      const quantity = order.quantity || 0;
      const price = order.product?.price || 0;
      totalSales += quantity * price;

      if (!order.isPaid) unpaidOrders += 1;
    }

    for (const order of todaysOrders) {
      const quantity = order.quantity || 0;
      const price = order.product?.price || 0;
      revenue += quantity * price;
    }

    res.json({
      totalOrders: orders.length,
      totalSales,
      revenueToday: revenue,
      unpaidOrders,
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({ message: "Failed to get order stats" });
  }
};

