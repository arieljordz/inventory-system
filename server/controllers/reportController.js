// controllers/reportController.js

import InventoryDetail from "../models/InventoryDetail.js";
import Product from "../models/Product.js";

export const getReportData = async (req, res) => {
  try {
    const { reportType = "inventory", from, to } = req.query;

    // Build date filter if provided
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Fetch inventory details with product info
    const report = await InventoryDetail.find({
      ...dateFilter,
      ...(reportType === "sales" ? { movementType: "OUT" } : {}),
      ...(reportType === "inventory" ? {} : {}),
      ...(reportType === "pickups" ? { status: "For Pick Up" } : {}),
    })
      .populate("product", "name serialNumber price")
      .sort({ createdAt: -1 });

    res.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};
