import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";
import { normalizeString, normalizeText } from "../utils/commonUtils.js";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "pcs" },
    variant: { type: String, default: "" },
    supplier: { type: String, default: "" },
    location: { type: String, default: "Main Warehouse" },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.AVAILABLE,
    },

    normalizedName: { type: String, index: true },
    normalizedSku: { type: String, index: true },
    normalizedVariant: { type: String, index: true }, // ✅ new field
  },
  { timestamps: true }
);

// Normalize before save
itemSchema.pre("save", function (next) {
  this.name = normalizeText(this.name);
  this.sku = normalizeText(this.sku);
  this.variant = normalizeText(this.variant);

  this.normalizedName = normalizeString(this.name);
  this.normalizedSku = normalizeString(this.sku);
  this.normalizedVariant = normalizeString(this.variant);

  next();
});

export default mongoose.model("Item", itemSchema);
