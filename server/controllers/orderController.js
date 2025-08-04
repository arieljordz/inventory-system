import path from "path";
import xlsx from "xlsx";
import moment from "moment-timezone";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";

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
    const platform = req.body.platform;
    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No valid file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      return res.status(400).json({
        message: "Unsupported file format. Please upload .csv, .xlsx, or .xls files.",
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const results = {
      imported: [],
      skipped: [],
    };

    for (const row of rows) {
      const platformOrderId = row["Order ID"]?.toString().trim();
      const name = row["Product Name"]?.trim();
      const courier = row["Shipping Option"]?.trim();
      const variant = row["Variation Name"]?.trim() || "";
      const quantity = parseInt(row["Quantity"]) || 0;

      if (!name || !quantity || quantity <= 0 || !courier) {
        results.skipped.push({ platformOrderId, reason: "Invalid row data" });
        continue;
      }

      const product = await Product.findOne({ name, variant });
      if (!product) {
        results.skipped.push({ platformOrderId, reason: "Product not found" });
        continue;
      }

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
        remarks: "Tagged for pickup",
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
    }

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

