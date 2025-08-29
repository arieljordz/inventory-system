// helpers/inventoryUtils.js
import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import { logAudit } from "./auditLogger.js";

export const restockProductHelper = async (item, req) => {
  if (!item || !item.product || !item.quantity) {
    throw new Error("Invalid item: missing product or quantity");
  }

  const quantity = parseInt(item.quantity, 10);
  if (!quantity || quantity <= 0) {
    throw new Error("Quantity must be a number greater than zero");
  }

  const product = await Product.findById(item.product);
  if (!product) throw new Error("Product not found");

  const before = product.toObject();

  // Update quantity
  product.quantity += quantity;

  // Update status if quantity >= 1
  if (product.quantity >= 1 && product.status !== StatusEnum.AVAILABLE) {
    product.status = StatusEnum.AVAILABLE;
  }

  await product.save();

  // Log inventory detail
  await InventoryDetail.create({
    product: product._id,
    movementType: MovementTypeEnum.IN,
    quantity,
    remarks: "Returned product restock",
    status: StatusEnum.AVAILABLE,
  });

  // Log audit if user/ip info is provided in the item
  await logAudit({
    action: "RESTOCK_RETURNED_PRODUCT",
    user: req.user?._id,
    description: `Restocked product: ${product.name}, quantity: ${quantity}, variant: ${product.variant}`,
    collectionName: "Product",
    documentId: product._id,
    before,
    after: product.toObject(),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return product;
};
