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

export const normalizeHeader = (str) =>
  str
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/[_\-\/]/g, " "); // treat _, -, / as spaces

// --- Platform configuration for orders---
export const orderPlatformConfigs = {
  shopee: {
    sheetName: "orders",
    fieldMap: {
      platformOrderId: "Order ID",
      name: "Product Name",
      courier: "Shipping Option",
      variant: "Variation Name",
      quantity: "Quantity",
      orderDate: "Order Creation Date",
    },
  },
  tiktok: {
    sheetName: "OrderSKUList",
    fieldMap: {
      platformOrderId: "Order ID",
      name: "Product Name",
      courier: "Delivery Option",
      variant: "Variation",
      quantity: "Quantity",
      orderDate: "Created Time",
    },
  },
  lazada: {
    sheetName: "sheet1",
    fieldMap: {
      platformOrderId: "orderItemId",
      name: "itemName",
      courier: "shippingProviderType",
      variant: "variation",
      quantity: "Quantity",
      orderDate: "createTime",
    },
  },
};


// --- Platform configuration for sales ---
export const salesPlatformConfigs = {
  shopee: {
    sheetName: "Income",
    fields: {
      platformOrderId: "Order ID",
    },
  },
  tiktok: {
    sheetName: "Order details",
    fields: {
      platformOrderId: "Order/adjustment ID",
    },
  },
  lazada: {
    sheetName: "Income Overview",
    fields: {
      platformOrderId: "Order Number",
    },
  },
};

// --- Platform configuration for return ---
export const returnPlatformConfigs = {
  shopee: {
    sheetName: "Income",
    fields: {
      platformOrderId: "Order ID",
    },
  },
  tiktok: {
    sheetName: "Order details",
    fields: {
      platformOrderId: "Order/adjustment ID",
    },
  },
  lazada: {
    sheetName: "Income Overview",
    fields: {
      platformOrderId: "Order Number",
    },
  },
};
