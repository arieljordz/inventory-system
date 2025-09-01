import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";
import { normalizeString, normalizeText } from "../utils/commonUtils.js";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    variant: {
      type: String,
      default: "",
    },
    supplier: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Main Warehouse",
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.AVAILABLE,
    },

    // 🔹 Normalized fields for reliable search & indexing
    normalizedName: { type: String, index: true },
    normalizedSku: { type: String, index: true },
    normalizedVariant: { type: String, index: true },
    normalizedDescription: { type: String, index: true },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook: Normalize before saving
itemSchema.pre("save", function (next) {
  this.name = normalizeText(this.name);
  this.sku = normalizeText(this.sku);
  this.variant = normalizeText(this.variant || "");
  this.description = normalizeText(this.description || "");

  this.normalizedName = normalizeString(this.name);
  this.normalizedSku = normalizeString(this.sku);
  this.normalizedVariant = normalizeString(this.variant || "");
  this.normalizedDescription = normalizeString(this.description || "");

  next();
});

// 🔹 Pre-update hook: Normalize fields when updating
itemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  if (update.name) {
    update.name = normalizeText(update.name);
    update.normalizedName = normalizeString(update.name);
  }
  if (update.sku) {
    update.sku = normalizeText(update.sku);
    update.normalizedSku = normalizeString(update.sku);
  }
  if (update.variant) {
    update.variant = normalizeText(update.variant);
    update.normalizedVariant = normalizeString(update.variant);
  }
  if (update.description) {
    update.description = normalizeText(update.description);
    update.normalizedDescription = normalizeString(update.description);
  }

  next();
});

// 🔹 Optional compound index to avoid duplicates (name + sku + variant)
itemSchema.index(
  { normalizedName: 1, normalizedSku: 1, normalizedVariant: 1 },
  { unique: true }
);

export default mongoose.model("Item", itemSchema);
