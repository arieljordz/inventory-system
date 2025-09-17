// controllers/walkInController.js
import moment from "moment-timezone";
import Item from "../models/Item.js";
import ItemMovement from "../models/ItemMovement.js";
import WalkInTransaction from "../models/WalkInTransaction.js";
import { logAudit } from "../utils/auditLogger.js";

export const createWalkInTransaction = async (req, res) => {
  try {
    const { items, buyerName, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalAmount = 0;
    const transactionItems = [];

    for (const cartItem of items) {
      const { itemId, quantity } = cartItem;
      const item = await Item.findById(itemId);
      if (!item) throw new Error("Item not found");
      if (item.quantity < quantity)
        throw new Error(`Insufficient stock for ${item.name}`);

      const before = item.toObject(); // snapshot before update

      // deduct stock
      item.quantity -= quantity;
      await item.save();

      const lineTotal = item.price * quantity;
      totalAmount += lineTotal;

      // record movement
      const movement = new ItemMovement({
        item: item._id,
        type: "OUT",
        quantity,
        price: item.price,
        balanceAfter: item.quantity,
        reference: "WALK_IN",
        remarks: `Walk-in purchase by ${buyerName || "Customer"}`,
        createdBy: req.user?._id,
      });

      await movement.save();

      // log audit
      // await logAudit({
      //   action: "WALKIN_SALE",
      //   user: req.user?._id,
      //   description: `Walk-in sale: ${item.name}, qty: ${quantity}, new balance: ${item.quantity}`,
      //   collectionName: "Item",
      //   documentId: item._id,
      //   before,
      //   after: item.toObject(),
      //   ip: req.ip,
      //   userAgent: req.headers["user-agent"],
      // });

      // record in transaction
      transactionItems.push({
        item: item._id,
        quantity,
        price: item.price,
        total: lineTotal,
      });
    }

    // create transaction record
    const walkInTransaction = new WalkInTransaction({
      items: transactionItems,
      totalAmount,
      buyerName: buyerName || "Walk-in Customer",
      paymentMethod: paymentMethod || "Cash",
      createdBy: req.user?._id,
    });

    await walkInTransaction.save();

    // log audit for transaction itself
    await logAudit({
      action: "CREATE_WALKIN_TRANSACTION",
      user: req.user?._id,
      description: `Created walk-in transaction for ${
        buyerName || "Customer"
      } with total ₱${totalAmount}`,
      collectionName: "WalkInTransaction",
      documentId: walkInTransaction._id,
      before: null,
      after: walkInTransaction.toObject(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      message: "Walk-in transaction recorded successfully",
      transaction: walkInTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyWalkInStats = async (req, res) => {
  try {
    const timezone = "Asia/Manila"; // adjust if needed
    const startOfMonth = moment().tz(timezone).startOf("month").toDate();
    const endOfMonth = moment().tz(timezone).endOf("month").toDate();

    // 🔹 Aggregate this month's stats
    const stats = await WalkInTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalSales: { $sum: "$totalAmount" },
                transactionCount: { $sum: 1 },
              },
            },
          ],
          topItem: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.item", // references Item model
                totalQty: { $sum: "$items.quantity" },
              },
            },
            { $sort: { totalQty: -1 } },
            { $limit: 1 },
          ],
        },
      },
    ]);

    // 🔹 Extract results safely
    const totals = stats[0]?.totals[0] || {
      totalSales: 0,
      transactionCount: 0,
    };
    const topItemData = stats[0]?.topItem[0] || null;

    // 🔹 Compute average transaction value
    const avgTransactionValue =
      totals.transactionCount > 0
        ? totals.totalSales / totals.transactionCount
        : 0;

    // 🔹 Get top-selling item details
    let topSellingItem = null;
    if (topItemData?._id) {
      const item = await Item.findById(topItemData._id).select("name sku");
      topSellingItem = {
        name: item?.name || "Unknown Item",
        sku: item?.sku || "",
        quantity: topItemData.totalQty,
      };
    }

    res.json({
      range: {
        start: startOfMonth,
        end: endOfMonth,
      },
      totalSales: totals.totalSales,
      transactionCount: totals.transactionCount,
      avgTransactionValue,
      topSellingItem,
    });
  } catch (err) {
    console.error("❌ Error getting monthly walk-in stats:", err);
    res.status(500).json({ message: "Failed to fetch monthly walk-in stats" });
  }
};
