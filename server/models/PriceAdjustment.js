// models/PriceAdjustment.model.js
import mongoose from "mongoose";

const priceAdjustmentSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["Product", "Item"], required: true },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },

    adjustmentType: { type: String, enum: ["markup", "discount"], required: true },
    valueType: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true }, // e.g. 10% or $50

    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },

    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("PriceAdjustment", priceAdjustmentSchema);
