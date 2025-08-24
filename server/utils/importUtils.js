import path from "path";
import xlsx from "xlsx";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "../utils/auditLogger.js";
import { normalizeString, normalizeText } from "./commonUtils.js";

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

// export const processOrderRows = async (rows, fieldMap, platform, req) => {
//   const results = { imported: [], skipped: [] };

//   for (const row of rows) {
//     try {
//       const platformOrderId = row[fieldMap.platformOrderId]?.toString().trim();
//       const name = normalizeText(row[fieldMap.name]?.trim() || "");
//       const courier = normalizeText(row[fieldMap.courier]?.trim() || "");
//       let variant = normalizeText(row[fieldMap.variant]?.trim() || "");
//       const quantity = parseInt(row[fieldMap.quantity]) || 0;

//       // ✅ Treat empty variant as "Default"
//       if (!variant) {
//         variant = "Default";
//       }

//       // --- Validation checks ---
//       if (!platformOrderId || !name || !courier || quantity <= 0) {
//         results.skipped.push({
//           platformOrderId: platformOrderId || "N/A",
//           reason: "Invalid row data",
//         });
//         continue;
//       }

//       // --- Find the product ---
//       const product = await Product.findOne({
//         normalizedName: normalizeString(name),
//         normalizedVariant: normalizeString(variant),
//       });

//       if (!product) {
//         results.skipped.push({ platformOrderId, reason: "Product not found" });
//         continue;
//       }

//       // --- Check for duplicate order ---
//       const existingOrder = await Order.findOne({
//         product: product._id,
//         platformOrderId,
//         platform,
//       });

//       if (existingOrder) {
//         results.skipped.push({
//           platformOrderId,
//           reason: "Order already imported",
//         });
//         continue;
//       }

//       // --- Stock validation ---
//       if (quantity > product.quantity) {
//         results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
//         continue;
//       }

//       // --- Create new order ---
//       const order = await Order.create({
//         product: product._id,
//         quantity,
//         platform,
//         platformOrderId,
//         courier,
//         remarks: "Tagged for pickup - imported orders",
//       });

//       // --- Update product stock ---
//       const remainingQty = product.quantity - quantity;
//       const updatedProduct = await Product.findByIdAndUpdate(
//         product._id,
//         {
//           quantity: remainingQty,
//           ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
//         },
//         { new: true }
//       );

//       // --- Record inventory movement ---
//       const inventoryDetail = await InventoryDetail.create({
//         product: product._id,
//         order: order._id,
//         movementType: "OUT",
//         quantity,
//         courier,
//         platform,
//         status: StatusEnum.FOR_PICK_UP,
//         remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
//       });

//       // ✅ Push imported with reason
//       results.imported.push({
//         platformOrderId,
//         reason: "Order imported successfully",
//         product: updatedProduct,
//         order,
//         inventoryDetail,
//       });

//       // --- Audit log ---
//       await logAudit({
//         action: "IMPORT_ORDER",
//         user: req.user?._id || null,
//         description: `Imported order from ${platform} with Order ID: ${platformOrderId}`,
//         collectionName: "Order",
//         documentId: order._id,
//         before: null,
//         after: { order, inventoryDetail, product: updatedProduct },
//         ip: req.ip,
//         userAgent: req.headers["user-agent"],
//       });
//     } catch (err) {
//       // ✅ Catch unexpected errors
//       results.skipped.push({
//         platformOrderId: row[fieldMap.platformOrderId] || "N/A",
//         reason: `Error processing row: ${err.message}`,
//       });
//     }
//   }

//   return {
//     message: "Order import completed",
//     summary: {
//       imported: results.imported.length,
//       skipped: results.skipped.length,
//     },
//     details: results,
//   };
// };

// for sales import
export const extractOrderIds = (rows, orderIdKey) => {
  return rows
    .map((row) => row[orderIdKey])
    .filter((id) => typeof id === "string" && id.trim() !== "")
    .map((id) => id.trim());
};

export const processOrderRows = async (rows, fieldMap, platform, req) => {
  const results = { imported: [], skipped: [] };

  // ✅ Skip metadata/header rows depending on platform
  let startIndex = 0;
  if (platform.toLowerCase() === "tiktok") {
    startIndex = 2; // skip 2 rows
  } else if (["shopee", "lazada"].includes(platform.toLowerCase())) {
    startIndex = 1; // skip 1 row
  }

  const actualRows = rows.slice(startIndex);

  for (const row of actualRows) {
    try {
      const platformOrderId = row[fieldMap.platformOrderId]?.toString().trim();
      const name = normalizeText(row[fieldMap.name]?.trim() || "");
      const courier = normalizeText(row[fieldMap.courier]?.trim() || "");
      let variant = normalizeText(row[fieldMap.variant]?.trim() || "");
      const quantity = parseInt(row[fieldMap.quantity]) || 0;

      // ✅ Treat empty variant as "Default"
      if (!variant) {
        variant = "Default";
      }

      // --- Validation checks ---
      if (!platformOrderId || !name || !courier || quantity <= 0) {
        results.skipped.push({
          platformOrderId: platformOrderId || "N/A",
          reason: "Invalid row data",
        });
        continue;
      }

      // --- Find the product ---
      const product = await Product.findOne({
        normalizedName: normalizeString(name),
        normalizedVariant: normalizeString(variant),
      });

      if (!product) {
        results.skipped.push({ platformOrderId, reason: "Product not found" });
        continue;
      }

      // --- Check for duplicate order ---
      const existingOrder = await Order.findOne({
        product: product._id,
        platformOrderId,
        platform,
      });

      if (existingOrder) {
        results.skipped.push({
          platformOrderId,
          reason: "Order already imported",
        });
        continue;
      }

      // --- Stock validation ---
      if (quantity > product.quantity) {
        results.skipped.push({ platformOrderId, reason: "Insufficient stock" });
        continue;
      }

      // --- Create new order ---
      const order = await Order.create({
        product: product._id,
        quantity,
        platform,
        platformOrderId,
        courier,
        remarks: "Tagged for pickup - imported orders",
      });

      // --- Update product stock ---
      const remainingQty = product.quantity - quantity;
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          quantity: remainingQty,
          ...(remainingQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
        },
        { new: true }
      );

      // --- Record inventory movement ---
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

      // ✅ Push imported with reason
      results.imported.push({
        platformOrderId,
        reason: "Order imported successfully",
        product: updatedProduct,
        order,
        inventoryDetail,
      });

      // --- Audit log ---
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
    } catch (err) {
      // ✅ Catch unexpected errors
      results.skipped.push({
        platformOrderId: row[fieldMap.platformOrderId] || "N/A",
        reason: `Error processing row: ${err.message}`,
      });
    }
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
