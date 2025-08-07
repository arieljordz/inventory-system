import path from "path";
import xlsx from "xlsx";

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
      sheetName: "income",
      fields: {
        platformOrderId: "Order ID",
      },
    },
  },
  titok: {
    order: {
      sheetName: "Orders",
      fields: {
        platformOrderId: "Order Number",
        name: "Item Name",
        courier: "Delivery Method",
        variant: "SKU",
        quantity: "Qty",
      },
    },
    sales: {
      sheetName: "Sales",
      fields: {
        platformOrderId: "Order Number",
      },
    },
  },
  lazada: {
    order: {
      sheetName: "Orders",
      fields: {
        platformOrderId: "Order Number",
        name: "Item Name",
        courier: "Delivery Method",
        variant: "SKU",
        quantity: "Qty",
      },
    },
    sales: {
      sheetName: "Sales",
      fields: {
        platformOrderId: "Order Number",
      },
    },
  },
};

export const getPlatformMappings = (platform, type) => {
  console.log("Looking for mapping:", { platform, type });
  const platformMap = platformMappings[platform.toLowerCase()];
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

export const getSheetRows = (file, sheetName) => {
  const workbook = xlsx.read(file.buffer, { type: "buffer" });
  const sheet =
    workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error(`Sheet \"${sheetName}\" not found in uploaded file.`);
  }

  return xlsx.utils.sheet_to_json(sheet);
};

export const extractOrderIds = (rows, orderIdKey) => {
  return rows.map((row) => String(row[orderIdKey]).trim()).filter((id) => !!id);
};
