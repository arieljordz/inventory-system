// controllers/settingsController.js
import Order from "../models/Order.js";
import { logAudit } from "../utils/auditLogger.js";
import FeatureFlag from "../models/FeatureFlag.js";
import {
  MongoClient,
  ObjectId,
  Binary,
  Decimal128,
  Long,
  Double,
  Int32,
} from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const BACKUP_URI = process.env.BACKUP_URI;
const BACKUP_DIR = path.resolve("./backups");

// Get all collection names
export const getCollections = async (req, res) => {
  const client = new MongoClient(BACKUP_URI);
  try {
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    res.status(200).json(names);
  } catch (err) {
    console.error("Get collections error:", err.message);
    res.status(500).json({ error: "Failed to fetch collections" });
  } finally {
    await client.close();
  }
};

// Transform function (Extended JSON types)
function transformToExtendedJSON(value) {
  if (value instanceof ObjectId) return { $oid: value.toString() };
  if (value instanceof Date) return { $date: value.toISOString() };
  if (value instanceof Int32) return { $numberInt: value.toString() };
  if (value instanceof Long) return { $numberLong: value.toString() };
  if (value instanceof Double)
    return { $numberDouble: value.valueOf().toString() };
  if (value instanceof Decimal128) return { $numberDecimal: value.toString() };
  if (value instanceof Binary) {
    return {
      $binary: {
        base64: value.buffer.toString("base64"),
        subType: value.sub_type.toString(16).padStart(2, "0"),
      },
    };
  }
  if (Array.isArray(value)) return value.map(transformToExtendedJSON);
  if (value && typeof value === "object") {
    const transformed = {};
    for (const key in value)
      transformed[key] = transformToExtendedJSON(value[key]);
    return transformed;
  }
  return value;
}

// Format timestamp folder name
function formatTimestampToDateTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(date.getDate()).padStart(2, "0")}_${String(
    date.getHours()
  ).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
}

// Format suffix for JSON filenames (_MMDDYYYY)
function formatDateSuffix() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `_${mm}${dd}${yyyy}`;
}

// Manual Backup Endpoint (creates timestamped folder + JSON files)
export const backupCollections = async (req, res) => {
  const client = new MongoClient(BACKUP_URI);

  try {
    await client.connect();
    const db = client.db();

    const { collections } = req.body; // ["products","orders"] or ["all"]

    const allCollections = await db.listCollections().toArray();
    let collectionNames = allCollections.map((c) => c.name);

    const selected = collections.includes("all")
      ? collectionNames
      : collections;

    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

    const folderName = `backups_${formatTimestampToDateTime(Date.now())}`;
    const folderPath = path.join(BACKUP_DIR, folderName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    const backups = [];

    for (const name of selected) {
      const docs = await db.collection(name).find({}).toArray();
      const transformedDocs = docs.map(transformToExtendedJSON);

      // ✅ Add suffix like _09052025
      const fileName = `${name}${formatDateSuffix()}.json`;
      const filePath = path.join(folderPath, fileName);

      fs.writeFileSync(
        filePath,
        JSON.stringify(transformedDocs, null, 2),
        "utf-8"
      );

      const relativePath = path.join(folderName, fileName).replace(/\\/g, "/");

      backups.push({
        collection: name,
        file: relativePath,
        count: docs.length,
      });
    }

    res
      .status(200)
      .json({ message: "Backup completed", backups, folder: folderName });
  } catch (err) {
    console.error("Backup error:", err.message);
    res.status(500).json({ error: "Backup failed" });
  } finally {
    await client.close();
  }
};

// Download a single backup JSON file
export const downloadBackup = async (req, res) => {
  const file = req.params.file;
  const safePath = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(BACKUP_DIR, safePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
};

// Feature Flags End Points
export const getFeatureFlags = async (req, res) => {
  try {
    const flags = await FeatureFlag.find().sort({ createdAt: -1 });
    return res.json(flags);
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return res.status(500).json({ message: "Failed to fetch feature flags" });
  }
};

export const updateFeatureFlag = async (req, res) => {
  try {
    const { key } = req.params;
    const { enabled, description } = req.body;

    const flag = await FeatureFlag.findOneAndUpdate(
      { key },
      {
        ...(enabled !== undefined && { enabled }),
        ...(description !== undefined && { description }),
        updatedBy: req.user?._id, // optional
      },
      { new: true }
    );

    if (!flag) {
      return res
        .status(404)
        .json({ message: `Feature flag '${key}' not found` });
    }

    return res.json(flag);
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return res.status(500).json({ message: "Failed to update feature flag" });
  }
};

export const getFeatureFlag = async (req, res) => {
  try {
    const { key } = req.params;
    const flag = await FeatureFlag.findOne({ key });

    if (!flag) {
      return res
        .status(404)
        .json({ message: `Feature flag '${key}' not found` });
    }

    return res.json(flag);
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    return res.status(500).json({ message: "Failed to fetch feature flag" });
  }
};

// Support Order Endpoints
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const orders = await Order.find({ orderNumber }).populate("product");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // console.log("Fetched orders:", orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderById = async (req, res) => {
  try {
    const { id } = req.params; // use unique _id instead of orderNumber
    const { status, isPaid, remarks, quantity, price, orderDate } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const before = order.toObject();

    if (status) order.status = status;
    if (typeof isPaid === "boolean") order.isPaid = isPaid;
    if (remarks !== undefined) order.remarks = remarks;
    if (quantity !== undefined && !isNaN(quantity))
      order.quantity = Number(quantity);
    if (price !== undefined && !isNaN(price)) order.price = Number(price);
    if (orderDate) {
      const parsedDate = new Date(orderDate);
      if (!isNaN(parsedDate)) order.orderDate = parsedDate;
    }

    await order.save();

    await logAudit({
      action: "SUPPORT_UPDATE_ORDER",
      user: req.user?._id || null,
      description: `Updated order ${order.orderNumber}`,
      collectionName: "Order",
      documentId: order._id,
      before,
      after: order.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};
