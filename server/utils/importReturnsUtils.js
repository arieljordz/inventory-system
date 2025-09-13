import moment from "moment-timezone";
import path from "path";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "./auditLogger.js";
import { updateItemQuantities } from "./itemQuantityUtils.js";

// --- Platform configuration for return ---
export const returnPlatformConfigs = {
  shopee: {
    sheetName: "orders",
    fields: {
      platformOrderId: "Order ID",
    },
    requiredHeaders: ["Order ID", "Adjustment Amount"],
  },
  tiktok: {
    sheetName: "OrderSKUList",
    fields: {
      platformOrderId: "Order ID",
    },
    requiredHeaders: ["Order ID", "Sku Quantity of return"],
  },
  lazada: {
    sheetName: "sheet1",
    fields: {
      platformOrderId: "orderItemId",
    },
    requiredHeaders: ["orderItemId", "Guarantee"],
  },
};

