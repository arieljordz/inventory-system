// helpers/inventoryUtils.js
import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import Item from "../models/Item.js";
import ItemMovement from "../models/ItemMovement.js";
import { StatusEnum, MovementTypeEnum } from "../enums/enums.js";
import { logAudit } from "./auditLogger.js";

// update items quantity
export const updateItemQuantities = async (product, orderQty, options = {}) => {
  const { userId, platformOrderId, platform, courier } = options;

  if (product.type === "single") {
    // Product is directly tied to an Item
    const item = await Item.findOne({
      normalizedName: product.normalizedName,
      normalizedVariant: product.normalizedVariant,
    });

    if (!item) throw new Error("Item not found for single product");

    const newItemQty = item.quantity - orderQty;
    if (newItemQty < 0) throw new Error("Insufficient stock for item");

    // Update Item
    await Item.findByIdAndUpdate(item._id, {
      quantity: newItemQty,
      ...(newItemQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
    });

    // Update Product
    const newProductQty = product.quantity - orderQty;
    await Product.findByIdAndUpdate(product._id, {
      quantity: newProductQty,
      ...(newProductQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
    });

    // Record Movement
    await ItemMovement.create({
      item: item._id,
      type: "OUT",
      quantity: orderQty,
      price: item.price,
      balanceAfter: newItemQty,
      reference: platformOrderId,
      remarks: `Order from ${platform} - ${courier}`,
      createdBy: userId || null,
    });
  }

  if (product.type === "bundle") {
    // Reduce stock for each component item
    for (const comp of product.components) {
      const item = await Item.findById(comp.item);
      if (!item) continue;

      const totalQty = comp.qty * orderQty;
      const newItemQty = item.quantity - totalQty;
      if (newItemQty < 0)
        throw new Error(
          `Insufficient stock for item: ${item.name} (bundle component)`
        );

      // Update Item
      await Item.findByIdAndUpdate(item._id, {
        quantity: newItemQty,
        ...(newItemQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
      });

      // Record Movement
      await ItemMovement.create({
        item: item._id,
        type: "OUT",
        quantity: totalQty,
        price: item.price,
        balanceAfter: newItemQty,
        reference: platformOrderId,
        remarks: `Bundle component for ${product.name} - ${platform}`,
        createdBy: userId || null,
      });
    }

    // Update Product after processing all components
    const newProductQty = product.quantity - orderQty;
    await Product.findByIdAndUpdate(product._id, {
      quantity: newProductQty,
      ...(newProductQty === 0 && { status: StatusEnum.OUT_OF_STOCK }),
    });
  }
};

// Restock items if returned
export const restockItemQuantities = async (
  product,
  orderQty,
  options = {}
) => {
  const { userId, platformOrderId, platform, courier } = options;

  if (product.type === "single") {
    const item = await Item.findOne({
      normalizedName: product.normalizedName,
      normalizedVariant: product.normalizedVariant,
    });

    if (!item) throw new Error("Item not found for single product");

    const newItemQty = item.quantity + orderQty;
    const newProductQty = product.quantity + orderQty;

    // Update item
    await Item.findByIdAndUpdate(item._id, {
      quantity: newItemQty,
      status: StatusEnum.AVAILABLE, // since restock always makes available
    });

    // Update product
    await Product.findByIdAndUpdate(product._id, {
      quantity: newProductQty,
      status: StatusEnum.AVAILABLE,
    });

    // Movement log
    await ItemMovement.create({
      item: item._id,
      type: "IN",
      quantity: orderQty,
      price: item.price,
      balanceAfter: newItemQty,
      reference: platformOrderId,
      remarks: `Returned order restocked from ${platform} - ${courier}`,
      createdBy: userId || null,
    });
  }

  if (product.type === "bundle") {
    let totalAddedToProduct = 0;

    for (const comp of product.components) {
      const item = await Item.findById(comp.item);
      if (!item) continue;

      const totalQty = comp.qty * orderQty;
      const newItemQty = item.quantity + totalQty;

      totalAddedToProduct += totalQty;

      // Update item
      await Item.findByIdAndUpdate(item._id, {
        quantity: newItemQty,
        status: StatusEnum.AVAILABLE,
      });

      // Movement log
      await ItemMovement.create({
        item: item._id,
        type: "IN",
        quantity: totalQty,
        price: item.price,
        balanceAfter: newItemQty,
        reference: platformOrderId,
        remarks: `Returned bundle component for ${product.name} - ${platform}`,
        createdBy: userId || null,
      });
    }

    // Update bundle product quantity (based on orders returned)
    const newProductQty = product.quantity + orderQty;

    await Product.findByIdAndUpdate(product._id, {
      quantity: newProductQty,
      status: StatusEnum.AVAILABLE,
    });
  }
};
