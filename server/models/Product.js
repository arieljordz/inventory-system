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
    shopName: {
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
      unique: false,
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
    type: {
      type: String,
      enum: ["single", "bundle"],
      default: "bundle",
    },
    components: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        qty: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.AVAILABLE,
    },

    // 🔹 Normalized fields for reliable lookups
    normalizedName: { type: String, index: true },
    normalizedVariant: { type: String, index: true },
    normalizedSku: { type: String, index: true },
    normalizedDescription: { type: String, index: true },
  },
  { timestamps: true }
);

// Pre-save hook to always set normalized values
productSchema.pre("save", function (next) {
  this.name = normalizeText(this.name);
  this.description = normalizeText(this.description || "");
  this.variant = normalizeText(this.variant || "");
  this.sku = normalizeText(this.sku || "");

  this.normalizedName = normalizeString(this.name);
  this.normalizedVariant = normalizeString(this.variant || "");
  this.normalizedSku = normalizeString(this.sku || "");
  this.normalizedDescription = normalizeString(this.description || "");

  next();
});

// 🔹 Pre-update hook for findOneAndUpdate / findByIdAndUpdate
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  // Normalize any updated fields
  if ("name" in update) {
    update.name = normalizeText(update.name || "");
    update.normalizedName = normalizeString(update.name || "");
  }

  if ("sku" in update) {
    update.sku = normalizeText(update.sku || "");
    update.normalizedSku = normalizeString(update.sku || "");
  }

  if ("description" in update) {
    update.description = normalizeText(update.description || "");
    update.normalizedDescription = normalizeString(update.description || "");
  }

  if ("variant" in update) {
    update.variant = normalizeText(update.variant || "");
    update.normalizedVariant = normalizeString(update.variant || "");
  }

  next();
});

// 🔹 Compound unique index: (name + variant + sku)
productSchema.index(
  { normalizedName: 1, normalizedVariant: 1, normalizedSku: 1 },
  { unique: true }
);

export default mongoose.model("Product", productSchema);
