import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";
import { normalizeString, normalizeText } from "../utils/commonUtils.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    imageId: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
    },
    variant: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      default: "pcs",
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

    // 🔹 Normalized fields for reliable lookups
    normalizedName: { type: String, index: true },
    normalizedVariant: { type: String, index: true },
  },
  { timestamps: true }
);

// Pre-save hook to always set normalized values
productSchema.pre("save", function (next) {
  // Clean display fields
  this.name = normalizeText(this.name);
  this.description = normalizeText(this.description || "");
  this.variant = normalizeText(this.variant || "");

  // Maintain search fields
  this.normalizedName = normalizeString(this.name);
  this.normalizedVariant = normalizeString(this.variant || "");

  next();
});

// 🔹 Compound unique index to enforce uniqueness of (name + variant)
productSchema.index(
  { normalizedName: 1, normalizedVariant: 1 },
  { unique: true }
);

export default mongoose.model("Product", productSchema);
