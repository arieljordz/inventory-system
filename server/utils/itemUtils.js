// utils/itemUtils.js
import mongoose from "mongoose";
import Item from "../models/Item.js";

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