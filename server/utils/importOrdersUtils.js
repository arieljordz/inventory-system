import moment from "moment-timezone";
import path from "path";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum } from "../enums/enums.js";
import { logAudit } from "./auditLogger.js";
import { updateItemQuantities } from "./itemQuantityUtils.js";

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

// --- Helper: Re-import existing order ---
export const handleReimportOrder = async ({
  existingOrder,
  product,
  quantity,
  platform,
  platformOrderId,
  courier,
  req,
}) => {
  const oldQty = existingOrder.quantity;
  const qtyDiff = quantity - oldQty;

  if (qtyDiff === 0) {
    return {
      type: "skipped",
      data: {
        platformOrderId,
        reason: "Order already imported",
      },
    };
  }

  if (qtyDiff > 0 && qtyDiff > product.quantity) {
    return {
      type: "skipped",
      data: {
        platformOrderId,
        reason: "Insufficient stock for Product",
      },
    };
  }

  try {
    await updateItemQuantities(product, qtyDiff, {
      userId: req.user?._id,
      platformOrderId,
      platform,
      courier,
    });

    existingOrder.quantity = quantity;
    await existingOrder.save();

    const inventoryDetail = await InventoryDetail.findOne({
      order: existingOrder._id,
    });

    if (inventoryDetail) {
      inventoryDetail.quantity = quantity;
      inventoryDetail.remarks = `Adjusted order - Order ID: ${platformOrderId}`;
      await inventoryDetail.save();
    }

    const updatedProduct = await Product.findById(product._id);

    await logAudit({
      action: "REIMPORT_ORDER",
      user: req.user?._id || null,
      description: `Adjusted imported order from ${platform} with Order ID: ${platformOrderId}`,
      collectionName: "Order",
      documentId: existingOrder._id,
      before: { oldQuantity: oldQty },
      after: { newQuantity: quantity },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return {
      type: "imported",
      data: {
        platformOrderId,
        product: updatedProduct,
        order: existingOrder,
        inventoryDetail,
        adjustment: true,
        reason: "Re-Imported Order, quantity updated",
      },
    };
  } catch (err) {
    return {
      type: "skipped",
      data: {
        platformOrderId,
        reason: `Re-import failed: ${err.message}`,
      },
    };
  }
};

// --- Helper: Create new order ---
export const handleNewOrder = async ({
  product,
  quantity,
  platform,
  platformOrderId,
  courier,
  orderDate,
  req,
}) => {
  if (quantity > product.quantity) {
    return {
      type: "skipped",
      data: { platformOrderId, reason: "Insufficient stock for Product" },
    };
  }

  const order = await Order.create({
    product: product._id,
    quantity,
    platform,
    platformOrderId,
    courier,
    orderDate,
    remarks: "Tagged for pickup - imported orders",
  });

  try {
    await updateItemQuantities(product, quantity, {
      userId: req.user?._id,
      platformOrderId,
      platform,
      courier,
    });
  } catch (err) {
    return {
      type: "skipped",
      data: {
        platformOrderId,
        reason: err.message,
      },
    };
  }

  const inventoryDetail = await InventoryDetail.create({
    product: product._id,
    order: order._id,
    movementType: "OUT",
    quantity,
    courier,
    platform,
    status: StatusEnum.ON_PROCESS,
    remarks: `Tagged for pickup - Order ID: ${platformOrderId}`,
  });

  const updatedProduct = await Product.findById(product._id);

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

  return {
    type: "imported",
    data: {
      platformOrderId,
      product: updatedProduct,
      order,
      inventoryDetail,
      adjustment: false,
      reason: "Imported Order",
    },
  };
};
