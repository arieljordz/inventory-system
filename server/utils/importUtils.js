import path from "path";

export const platformMappings = {
  shopee: {
    order: {
      sheetName: "orders",
      fields: {
        platformOrderId: "Order ID",
        name: "Product Name",
        courier: "Shipping Option",
        variant: "Variation Name",
        quantity: "Quantity",
      },
    },
    sales: {
      sheetName: "Income",
      fields: {
        platformOrderId: "Order ID",
      },
    },
  },
  tiktok: {
    order: {
      sheetName: "OrderSKUList",
      fields: {
        platformOrderId: "Order ID",
        name: "Product Name",
        courier: "Delivery Option",
        variant: "Variation",
        quantity: "Quantity",
      },
    },
    sales: {
      sheetName: "Order details",
      fields: {
        platformOrderId: "Order/adjustment ID",
      },
    },
  },
  lazada: {
    order: {
      sheetName: "sheet1",
      fields: {
        platformOrderId: "orderItemId",
        name: "itemName",
        courier: "shippingProviderType",
        variant: "variation",
        quantity: "Quantity",
      },
    },
    sales: {
      sheetName: "Income Overview",
      fields: {
        platformOrderId: "Order Number",
      },
    },
  },
};

// order: {
//   sheetName: "OrderSKUList",
//   fields: {
//     platformOrderId: "Platform unique order ID.",
//     name: "Platform product name.",
//     courier: "The order's delivery option.",
//     variant: "Platform SKU variation",
//     quantity: "SKU sold quantity in the order.",
//   },
// },

export const getPlatformMappings = (platform, type) => {
  const platformMap = platformMappings[platform.toLowerCase()];
  console.log("Looking for mapping:", { platform, type, platformMap });
  if (!platformMap || !platformMap[type]) {
    throw new Error("Unsupported platform or type.");
  }
  return platformMap[type];
};

export const validateFile = (file) => {
  if (!file?.buffer) {
    throw new Error("No valid file uploaded");
  }

  const ext = path
    .extname(file.originalname || "")
    .toLowerCase()
    .replace(".", "");
  if (!["csv", "xlsx", "xls"].includes(ext)) {
    throw new Error(
      "Unsupported file format. Please upload .csv, .xlsx, or .xls files."
    );
  }
};
