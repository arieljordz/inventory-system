import path from "path";
import xlsx from "xlsx";
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
