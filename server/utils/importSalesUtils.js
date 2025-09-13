import moment from "moment-timezone";
import path from "path";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "./auditLogger.js";
import { updateItemQuantities } from "./itemQuantityUtils.js";

// --- Platform configuration for sales ---
export const salesPlatformConfigs = {
  shopee: {
    sheetName: "Income",
    fields: {
      platformOrderId: "Order ID",
    },
    requiredHeaders: ["Order ID", "Buyer Payment Method"],
  },
  tiktok: {
    sheetName: "Order details",
    fields: {
      platformOrderId: "Order/adjustment ID",
    },
    requiredHeaders: ["Order/adjustment ID", "Order settled time"],
  },
  lazada: {
    sheetName: "Income Overview",
    fields: {
      platformOrderId: "Order Number",
    },
    requiredHeaders: ["Order Number", "Statement Period"],
  },
};
