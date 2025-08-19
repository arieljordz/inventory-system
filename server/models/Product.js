import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";
import { normalizeString } from "../utils/commonUtils.js";

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
  this.normalizedName = normalizeString(this.name);
  this.normalizedVariant = normalizeString(this.variant || "");
  next();
});

export default mongoose.model("Product", productSchema);
