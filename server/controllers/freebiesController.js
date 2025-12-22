// controllers/freebiesController.js
import Item from "../models/Item.js";
import ItemMovement from "../models/ItemMovement.js";
import FreebiesTransaction from "../models/FreebiesTransaction.js";
import { logAudit } from "../utils/auditLogger.js";
import { getCurrentMonthRange } from "../utils/dateUtils.js";

export const createFreebiesTransaction = async (req, res) => {
  try {
    const { items, buyerName } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    const transactionItems = [];

    for (const { itemId, quantity } of items) {
      const item = await Item.findById(itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });
      if (item.quantity < quantity)
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${item.name}` });

      const before = item.toObject();

      // Deduct stock
      item.quantity -= quantity;
      await item.save();

      // Record inventory movement (price = 0 for freebies)
      await ItemMovement.create({
        item: item._id,
        type: "OUT",
        quantity,
        price: 0, // FREEBIE
        balanceAfter: item.quantity,
        reference: "FREEBIES",
        remarks: `Freebie issued to ${buyerName || "Customer"}`,
        createdBy: req.user?._id,
      });

      // Store transaction item with reference price for reporting
      transactionItems.push({
        item: item._id,
        quantity,
        price: 0, // required for schema
        total: 0, // required for schema
        referencePrice: item.retailPrice,
        referenceTotal: item.retailPrice * quantity,
      });

      // Audit per item
      await logAudit({
        action: "FREEBIE_ITEM_OUT",
        user: req.user?._id,
        description: `Freebie issued: ${item.name} x${quantity}`,
        collectionName: "Item",
        documentId: item._id,
        before,
        after: item.toObject(),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    // Create Freebies transaction (totalAmount = 0)
    const transaction = await FreebiesTransaction.create({
      items: transactionItems,
      totalAmount: 0, // always zero for freebies
      buyerName: buyerName || "Freebies Customer",
      paymentMethod: "FREEBIE",
      isFreebie: true,
      createdBy: req.user?._id,
    });

    // Audit transaction
    await logAudit({
      action: "CREATE_FREEBIES_TRANSACTION",
      user: req.user?._id,
      description: `Freebie transaction created for ${buyerName || "Customer"}`,
      collectionName: "FreebiesTransaction",
      documentId: transaction._id,
      after: transaction.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      message: "Freebie transaction recorded successfully",
      transaction,
    });
  } catch (error) {
    console.error("❌ Freebie Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyFreebiesStats = async (req, res) => {
  try {
    const { start, end } = getCurrentMonthRange();

    const stats = await FreebiesTransaction.aggregate([
      { $match: { isFreebie: true, createdAt: { $gte: start, $lte: end } } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                transactionCount: { $sum: 1 },
                totalReferenceValue: { $sum: { $sum: "$items.referenceTotal" } },
              },
            },
          ],
          topItem: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.item",
                totalQty: { $sum: "$items.quantity" },
              },
            },
            { $sort: { totalQty: -1 } },
            { $limit: 1 },
          ],
        },
      },
    ]);

    const summary = stats[0]?.summary[0] || {
      transactionCount: 0,
      totalReferenceValue: 0,
    };

    const avgTransactionValue =
      summary.transactionCount > 0
        ? summary.totalReferenceValue / summary.transactionCount
        : 0;

    let topSellingItem = null;
    if (stats[0]?.topItem[0]?._id) {
      const item = await Item.findById(stats[0].topItem[0]._id).select(
        "name sku"
      );
      topSellingItem = {
        name: item?.name || "Unknown",
        sku: item?.sku || "",
        quantity: stats[0].topItem[0].totalQty,
      };
    }

    res.json({
      range: { start, end },
      transactionCount: summary.transactionCount,
      totalReferenceValue: summary.totalReferenceValue,
      avgTransactionValue,
      topSellingItem,
    });
  } catch (error) {
    console.error("❌ Freebies stats error:", error);
    res.status(500).json({ message: "Failed to fetch freebies stats" });
  }
};
