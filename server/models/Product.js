import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

const productSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
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
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.AVAILABLE,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
