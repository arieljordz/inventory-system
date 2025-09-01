import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    platformOrderId: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    courier: {
      type: String,
      required: true,
      trim: true,
    },
    orderDate: {
      type: Date,
      default: Date.now, 
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ON_PROCESS,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
