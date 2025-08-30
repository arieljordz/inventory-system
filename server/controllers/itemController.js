import mongoose from "mongoose";
import Item from "../models/Item.js";
import InventoryMovement from "../models/inventoryMovement.js";
import {
  normalizeText,
  normalizeString,
  escapeRegex,
} from "../utils/commonUtils.js";
import { generateSKU } from "../utils/skuGenerator.js";
import { logAudit } from "../utils/auditLogger.js";

export const getAllItems = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const normalizedSearch = normalizeString(normalizeText(search));
    const safeRegex = new RegExp(escapeRegex(normalizedSearch), "i");
    const rawSafeRegex = new RegExp(escapeRegex(search), "i");

    // Build match query for aggregation
    const match = search
      ? {
          $or: [
            { name: rawSafeRegex },
            { reference: rawSafeRegex },
            { description: rawSafeRegex },
            { normalizedName: safeRegex },
            { normalizedDescription: safeRegex },
            { normalizedReference: safeRegex },
          ],
        }
      : {};

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Item.aggregate(pipeline);

    const items = result[0].data;
    const totalItems = result[0].total[0]?.count || 0;

    res.status(200).json({
      items,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get All Items Error:", error);
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

// ✅ Get single item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Get Item By ID Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch item", error: error.message });
  }
};

// ADD ITEM (with initial inventory movement)
export const addItem = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      quantity,
      unit,
      variant,
      supplier,
      location,
      status,
      reference,
      remarks,
      createdBy,
    } = req.body;

    // ✅ Normalize inputs for duplicate check
    const normalizedName = normalizeString(normalizeText(name));
    const normalizedVariant = normalizeString(normalizeText(variant || ""));

    // ✅ Check if item with same name + variant already exists
    const existingItem = await Item.findOne({
      normalizedName,
      normalizedVariant,
    });

    if (existingItem) {
      return res.status(400).json({
        message: `Item with name "${name}" and variant "${variant || "N/A"}" already exists.`,
      });
    }

    // ✅ Generate SKU
    const sku = generateSKU({ name, category: "", variant, size: "" });

    // ✅ Create Item
    const newItem = new Item({
      name,
      price,
      sku,
      description,
      quantity,
      unit,
      variant,
      supplier,
      location,
      status,
      normalizedName,
      normalizedVariant,
    });

    await newItem.save();

    // ✅ If there's an initial quantity, log an IN movement
    if (quantity > 0) {
      await InventoryMovement.create({
        item: newItem._id,
        type: "IN",
        quantity,
        price,
        balanceAfter: quantity,
        reference: reference || "Initial Stock",
        location,
        remarks: remarks || "Initial stock added with item creation",
        createdBy,
      });
    }

    // ✅ Log audit (separate call, doesn’t affect item creation)
    await logAudit({
      action: "ADD_ITEM",
      user: req.user?._id,
      description: `Added new item: ${newItem.name}, Variant: ${newItem.variant || "N/A"}, SKU: ${newItem.sku}, quantity: ${quantity}`,
      collectionName: "Item",
      documentId: newItem._id,
      before: null,
      after: newItem.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// RESTOCK ITEM (add inventory movement IN)
export const restockItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, price, reference, location, remarks } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    // 🔎 Find item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Save "before" snapshot for audit
    const before = item.toObject();

    // Update item
    item.quantity += quantity;
    if (price) {
      item.price = price; // Update latest price if provided
    }
    await item.save();

    // Create movement log
    await InventoryMovement.create({
      item: item._id,
      type: "IN",
      quantity,
      price: price || item.price,
      balanceAfter: item.quantity,
      reference: reference || "Restock",
      location: location || item.location,
      remarks: remarks || "",
      createdBy: req.user?._id || null,
    });

    // ✅ Log audit
    await logAudit({
      action: "RESTOCK_ITEM",
      user: req.user?._id,
      description: `Restocked item: ${item.name}, quantity: ${quantity}, new balance: ${item.quantity}`,
      collectionName: "Item",
      documentId: item._id,
      before,
      after: item.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      message: "Item restocked successfully",
      item,
    });
  } catch (error) {
    console.error("Restock Item Error:", error);
    res.status(500).json({
      message: "Failed to restock item",
      error: error.message,
    });
  }
};

// ✅ Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, location, status } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Snapshot before changes for audit
    const before = item.toObject();

    // Update fields
    if (req.file) {
      item.image = req.file.path; // handled by multer/cloudinary
    }
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (location !== undefined) item.location = location;
    if (status !== undefined) item.status = status;

    const updatedItem = await item.save();

    // ✅ Audit log after save
    await logAudit({
      action: "UPDATE_ITEM",
      user: req.user?._id,
      description: `Updated item: ${updatedItem.name}, ID: ${updatedItem._id}`,
      collectionName: "Item",
      documentId: updatedItem._id,
      before,
      after: updatedItem.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update item", error: error.message });
  }
};

// ✅ Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Snapshot before deleting
    const before = item.toObject();

    // Cleanup related inventory movements
    await InventoryMovement.deleteMany({ item: id });

    // Delete item
    await item.deleteOne();

    // ✅ Audit log after delete
    await logAudit({
      action: "DELETE_ITEM",
      user: req.user?._id,
      description: `Deleted item: ${before.name} (${before.variant || "No Variant"})`,
      collectionName: "Item",
      documentId: id,
      before,
      after: null, // since deleted
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
};

