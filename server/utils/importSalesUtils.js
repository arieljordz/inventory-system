import moment from "moment-timezone";

// --- Platform configuration for sales ---
export const salesPlatformConfigs = {
  shopee: {
    sheetName: "Income",
    fields: {
      platformOrderId: "Order ID",
      orderNumber: "Order ID", 
    },
    requiredHeaders: ["Order ID", "Buyer Payment Method"],
  },
  tiktok: {
    sheetName: "Order details",
    fields: {
      platformOrderId: "Order/adjustment ID",
      orderNumber: "Order/adjustment ID", 
    },
    requiredHeaders: ["Order/adjustment ID", "Order settled time"],
  },
  lazada: {
    sheetName: "Income Overview",
    fields: {
      platformOrderId: "orderItemId",
      orderNumber: "orderNumber", 
    },
    requiredHeaders: ["orderNumber", "orderItemId"],
  },
};
