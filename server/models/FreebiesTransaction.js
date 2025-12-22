// models/FreebiesTransaction.js
import mongoose from "mongoose";

const freebiesTransactionSchema = new mongoose.Schema(
  {
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true, min: 1 },

        // 🔹 Store actual price for reporting, not counted as revenue
        referencePrice: { type: Number, required: true },
        referenceTotal: { type: Number, required: true },

        // 🔹 Optional: price and total always 0 to satisfy current validation
        price: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 }, // total for accounting (0 for freebies)
    buyerName: { type: String, default: "Freebies Customer" },
    paymentMethod: { type: String, default: "FREEBIE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isFreebie: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("FreebiesTransaction", freebiesTransactionSchema);
