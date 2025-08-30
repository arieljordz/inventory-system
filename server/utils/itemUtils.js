// utils/itemUtils.js
import mongoose from "mongoose";
import Item from "../models/Item.js";

export const deductBundleComponents = async (components, bundleQuantity) => {
  for (const comp of components) {
    const itemDoc = await Item.findById(comp.item);
    if (!itemDoc) {
      throw new Error(`Item with ID ${comp.item} not found.`);
    }

    const requiredQty = comp.qty * bundleQuantity;
    // const requiredQty = comp.qty * 1; // Always deduct 1 bundle at a time
    if (itemDoc.quantity < requiredQty) {
      throw new Error(
        `Insufficient stock for item "${itemDoc.name}". Required: ${requiredQty}, Available: ${itemDoc.quantity}`
      );
    }

    itemDoc.quantity -= requiredQty;
    await itemDoc.save();
  }
};

// Update bundle components for existing product
export const updateBundleComponents = async (oldComponents, newComponents, oldQty, newQty) => {
  // Restock old components
  for (const comp of oldComponents) {
    const item = await Item.findById(comp.item);
    if (item) {
      item.quantity += comp.qty * oldQty;
      await item.save();
    }
  }

  // Deduct new components
  for (const comp of newComponents) {
    const item = await Item.findById(comp.item);
    if (!item) throw new Error(`Item not found: ${comp.item}`);
    if (item.quantity < comp.qty * newQty) {
      throw new Error(`Not enough stock for item: ${item.name}`);
    }
    item.quantity -= comp.qty * newQty;
    await item.save();
  }
};

// Validate and parse components array

export const validateComponents = async (components) => {
  let parsed = components;

  // ✅ Parse JSON if it's a string
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (err) {
      console.error("Failed to parse components JSON:", err);
      return [];
    }
  }

  // ✅ Ensure it's an array
  if (!Array.isArray(parsed)) {
    console.warn("Components is not an array");
    return [];
  }

  const validComponents = [];

  for (const comp of parsed) {
    if (!comp?.item || !comp?.qty) continue;

    // ✅ Normalize comp.item (string or {_id: "123"})
    let itemId = comp.item;
    if (typeof itemId === "object" && itemId._id) {
      itemId = itemId._id;
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.warn(`Invalid ObjectId: ${itemId}`);
      continue;
    }

    const itemDoc = await Item.findById(itemId);
    if (!itemDoc) {
      console.warn(`Item not found: ${itemId}`);
      continue;
    }

    validComponents.push({ item: itemDoc._id, qty: comp.qty });
  }

  return validComponents;
};