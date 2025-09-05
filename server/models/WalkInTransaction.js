// models/WalkInTransaction.js
import mongoose from "mongoose";

const walkInTransactionSchema = new mongoose.Schema(
  {
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    buyerName: { type: String, default: "Walk-in Customer" },
    paymentMethod: { type: String, default: "Cash" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("WalkInTransaction", walkInTransactionSchema);
