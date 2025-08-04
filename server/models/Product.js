import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

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
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
