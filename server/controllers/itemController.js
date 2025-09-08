import mongoose from "mongoose";
import moment from "moment-timezone";
import Item from "../models/Item.js";
import ItemMovement from "../models/ItemMovement.js";
import {
  normalizeText,
  normalizeString,
  escapeRegex,
} from "../utils/commonUtils.js";
import { generateSKU } from "../utils/skuGenerator.js";
import { logAudit } from "../utils/auditLogger.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";

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

export const addItem = async (req, res) => {
  try {
    const {
      name,
      price,
      retailPrice,
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

    const normalizedName = normalizeString(normalizeText(name));
    const normalizedVariant = normalizeString(normalizeText(variant || ""));

    const existingItem = await Item.findOne({
      normalizedName,
      normalizedVariant,
    });

    if (existingItem) {
      return res.status(400).json({
        message: `Item with name "${name}" and variant "${
          variant || "N/A"
        }" already exists.`,
      });
    }

    const sku = generateSKU({ name, category: "", variant, size: "" });

    const newItem = new Item({
      name,
      price,
      retailPrice,
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

    if (quantity > 0) {
      await ItemMovement.create({
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

    await logAudit({
      action: "ADD_ITEM",
      user: req.user?._id,
      description: `Added new item: ${newItem.name}, Variant: ${
        newItem.variant || "N/A"
      }, SKU: ${newItem.sku}, quantity: ${quantity}`,
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

export const restockItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, price, retailPrice, reference, location, remarks } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const before = item.toObject();

    item.quantity += quantity;
    item.status = StatusEnum.AVAILABLE;
    if (price) {
      item.price = price;
      item.retailPrice = retailPrice;
    }
    await item.save();

    await ItemMovement.create({
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

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, variant, description, price, retailPrice, location, status, quantity } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const before = item.toObject();
    const oldPrice = item.price;

    if (name !== undefined) item.name = name;
    if (variant !== undefined) item.variant = variant;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (retailPrice !== undefined) item.retailPrice = retailPrice;
    if (location !== undefined) item.location = location;
    if (status !== undefined) item.status = status;
    // if (quantity !== undefined) item.quantity = quantity;

    const updatedItem = await item.save();

    if (price !== undefined && price !== oldPrice) {
      const movements = await ItemMovement.find({ item: item._id });

      for (const movement of movements) {
        movement.price = price;
        movement.totalValue = movement.quantity * price;
        await movement.save();
      }
    }

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

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const before = item.toObject();

    await ItemMovement.deleteMany({ item: id });

    await item.deleteOne();

    await logAudit({
      action: "DELETE_ITEM",
      user: req.user?._id,
      description: `Deleted item: ${before.name} (${
        before.variant || "No Variant"
      })`,
      collectionName: "Item",
      documentId: id,
      before,
      after: null,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const startOfDay = moment.tz("Asia/Manila").startOf("day").toDate();
    const endOfDay = moment.tz("Asia/Manila").endOf("day").toDate();

    const availableItems = await Item.find({ status: StatusEnum.AVAILABLE });
    const availableItemCount = availableItems.length;
    const totalAvailableQuantity = availableItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const todaysMovements = await ItemMovement.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalInToday = todaysMovements
      .filter((m) => m.type === MovementTypeEnum.IN)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalOutToday = todaysMovements
      .filter((m) => m.type === MovementTypeEnum.OUT)
      .reduce((sum, m) => sum + m.quantity, 0);

    res.json({
      availableItemCount,
      totalAvailableQuantity,
      totalInToday,
      totalOutToday,
    });
  } catch (error) {
    console.error("Error getting inventory stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
