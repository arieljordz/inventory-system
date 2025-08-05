import path from "path";
import xlsx from "xlsx";
import moment from "moment-timezone";
import Order from "../models/Order.js";

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
      .replace(".", "");

    if (!["csv", "xlsx", "xls"].includes(ext)) {
      return res.status(400).json({
        message:
          "Unsupported file format. Please upload .csv, .xlsx, or .xls files.",
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet =
      workbook.Sheets["income"] || workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      return res
        .status(400)
        .json({ message: "No readable sheet found in file." });
    }

    const rows = xlsx.utils.sheet_to_json(sheet);
    const platformOrderIds = rows
      .map((row) => String(row["Order ID"]).trim())
      .filter((id) => !!id);

    if (platformOrderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid order IDs found in file." });
    }

    const orders = await Order.find({
      platform,
      platformOrderId: { $in: platformOrderIds },
    });

    const results = {
      updated: [],
      alreadyPaid: [],
      notFound: [],
    };

    const orderMap = new Map(orders.map((o) => [o.platformOrderId, o]));

    for (const id of platformOrderIds) {
      const order = orderMap.get(id);

      if (!order) {
        results.notFound.push(id);
        continue;
      }

      if (order.isPaid) {
        results.alreadyPaid.push(order._id);
        continue;
      }

      order.isPaid = true;
      await order.save();
      results.updated.push(order._id);
    }

    res.json({
      message: `${results.updated.length} orders marked as paid.`,
      summary: {
        updated: results.updated.length,
        alreadyPaid: results.alreadyPaid.length,
        notFound: results.notFound.length,
      },
      details: results,
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
