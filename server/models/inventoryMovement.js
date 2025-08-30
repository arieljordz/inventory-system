import mongoose from "mongoose";
import { normalizeText } from "../utils/commonUtils.js";

const inventoryMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    totalValue: {
      type: Number,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Main Warehouse",
    },
    remarks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    normalizedReference: { type: String, index: true },
  },
  { timestamps: true }
);

// Auto-calc total value
inventoryMovementSchema.pre("save", function (next) {
  if (this.reference) {
    this.normalizedReference = normalizeText(this.reference);
  }

  this.totalValue = (this.quantity || 0) * (this.price || 0);
  next();
});

export default mongoose.model("InventoryMovement", inventoryMovementSchema);
