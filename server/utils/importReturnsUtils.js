import moment from "moment-timezone";

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

