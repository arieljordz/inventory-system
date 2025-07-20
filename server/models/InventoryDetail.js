import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

const inventoryDetailSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    movementType: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pickedUpBy: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.FOR_PICK_UP,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InventoryDetail", inventoryDetailSchema);
