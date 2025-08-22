import path from "path";
import xlsx from "xlsx";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import { normalizeString } from "./commonUtils.js";

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

export const getSheetRows = (file, sheetName, expectedFields) => {
  const workbook = xlsx.read(file.buffer, { type: "buffer" });

  // Normalize the sheetName input
  const targetName = sheetName.trim().toLowerCase();

  // Find a matching sheet name in a case-insensitive way
  const matchedSheetName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === targetName
  );

  if (!matchedSheetName) {
    throw new Error(`Sheet "${sheetName}" not found in uploaded file.`);
  }

  const sheet = workbook.Sheets[matchedSheetName];

  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  let headerRowIndex = 0,
    bestMatchCount = -1;

  rawRows.forEach((row, idx) => {
    const matches = expectedFields.filter((field) =>
      row
        .map((c) =>
          String(c || "")
            .trim()
            .toLowerCase()
        )
        .includes(field.toLowerCase())
    ).length;
    if (matches > bestMatchCount) {
      bestMatchCount = matches;
      headerRowIndex = idx;
    }
  });

  const headers = rawRows[headerRowIndex].map((h) => String(h || "").trim());
  return rawRows.slice(headerRowIndex + 1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
};

export const processOrderRows = async (rows, fieldMap, platform, req) => {
  const results = { imported: [], skipped: [] };

  for (const row of rows) {
    const platformOrderId = row[fieldMap.platformOrderId]?.toString().trim();
    const name = row[fieldMap.name]?.trim();
    const courier = row[fieldMap.courier]?.trim();
    const variant = row[fieldMap.variant]?.trim() || "";
    const quantity = parseInt(row[fieldMap.quantity]) || 0;

    // Validation checks
    if (!platformOrderId || !name || !courier || quantity <= 0) {
      results.skipped.push({
        platformOrderId: platformOrderId || "N/A",
        reason: "Invalid row data",
      });
      continue;
    }

    const existingOrder = await Order.findOne({ platformOrderId });
    if (existingOrder) {
      results.skipped.push({
        platformOrderId,
        reason: "Order already imported.",
      });
      continue;
    }

    const product = await Product.findOne({
      normalizedName: normalizeString(name),
      normalizedVariant: normalizeString(variant || ""),
    });

    if (!product) {
      results.skipped.push({ platformOrderId, reason: "Product not found" });
      continue;
    }

    if (quantity > product.quantity) {
      results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
      continue;
    }

    const order = await Order.create({
      product: product._id,
      quantity,
      platform,
      platformOrderId,
      courier,
      remarks: "Tagged for pickup - imported orders",
    });

    const remainingQty = product.quantity - quantity;
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        quantity: remainingQty,
        ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
      },
      { new: true }
    );

    const inventoryDetail = await InventoryDetail.create({
      product: product._id,
      order: order._id,
      movementType: "OUT",
      quantity,
      courier,
      platform,
      status: StatusEnum.FOR_PICK_UP,
      remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
    });

    results.imported.push({ product: updatedProduct, order, inventoryDetail });

    await logAudit({
      action: "IMPORT_ORDER",
      user: req.user?._id || null,
      description: `Imported order from ${platform} with Order ID: ${platformOrderId}`,
      collectionName: "Order",
      documentId: order._id,
      before: null,
      after: { order, inventoryDetail, product: updatedProduct },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  return {
    message: "Order import completed",
    summary: {
      imported: results.imported.length,
      skipped: results.skipped.length,
    },
    details: results,
  };
};

// for sales import
export const extractOrderIds = (rows, orderIdKey) => {
  return rows
    .map((row) => row[orderIdKey])
    .filter((id) => typeof id === "string" && id.trim() !== "")
    .map((id) => id.trim());
};
