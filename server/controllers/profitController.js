import mongoose from "mongoose";
import Order from "../models/Order.js";
import WalkInTransaction from "../models/WalkInTransaction.js";
import { normalizeString } from "../utils/commonUtils.js";

// 📌 Get all unique orders with products, items, and profit info
export const getOrdersWithProfits = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const searchRegex = new RegExp(normalizeString(search), "i");

    const match = search
      ? {
          $or: [
            { platformOrderId: searchRegex },
            { platform: searchRegex },
            { status: searchRegex },
          ],
        }
      : {};

    const pipeline = [
      { $match: match },

      // Lookup product info
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },

      // Lookup component items (if bundle)
      {
        $lookup: {
          from: "items",
          localField: "productInfo.components.item",
          foreignField: "_id",
          as: "itemsInfo",
        },
      },

      // Calculate productCost = sum(item.price × qtyInProduct) × order.quantity
      {
        $addFields: {
          productCost: {
            $multiply: [
              {
                $sum: {
                  $map: {
                    input: "$productInfo.components",
                    as: "comp",
                    in: {
                      $multiply: [
                        {
                          $getField: {
                            field: "price",
                            input: {
                              $first: {
                                $filter: {
                                  input: "$itemsInfo",
                                  cond: { $eq: ["$$this._id", "$$comp.item"] },
                                },
                              },
                            },
                          },
                        },
                        "$$comp.qty",
                      ],
                    },
                  },
                },
              },
              "$quantity",
            ],
          },
        },
      },

      // Calculate revenue & profit
      {
        $addFields: {
          revenue: { $multiply: ["$productInfo.price", "$quantity"] },
          profit: {
            $subtract: [
              { $multiply: ["$productInfo.price", "$quantity"] },
              "$productCost",
            ],
          },
        },
      },

      // Group by order
      {
        $group: {
          _id: "$_id",
          platformOrderId: { $first: "$platformOrderId" },
          platform: { $first: "$platform" },
          orderDate: { $first: "$orderDate" },
          courier: { $first: "$courier" },
          status: { $first: "$status" },
          quantity: { $first: "$quantity" },
          isPaid: { $first: "$isPaid" },
          remarks: { $first: "$remarks" },

          products: {
            $push: {
              sku: "$productInfo.sku",
              name: "$productInfo.name",
              variant: "$productInfo.variant",
              quantity: "$quantity",
              cost: "$productCost",
              price: "$productInfo.price",
              revenue: "$revenue",
              profit: "$profit",
            },
          },

          items: {
            $push: {
              $map: {
                input: "$productInfo.components",
                as: "comp",
                in: {
                  $let: {
                    vars: {
                      itemData: {
                        $first: {
                          $filter: {
                            input: "$itemsInfo",
                            cond: { $eq: ["$$this._id", "$$comp.item"] },
                          },
                        },
                      },
                    },
                    in: {
                      sku: "$$itemData.sku",
                      name: "$$itemData.name",
                      variant: "$$itemData.variant",
                      qtyInProduct: "$$comp.qty",
                      qtyForOrder: { $multiply: ["$$comp.qty", "$quantity"] },
                      cost: "$$itemData.price",
                      totalCost: {
                        $multiply: [
                          "$$itemData.price",
                          "$$comp.qty",
                          "$quantity",
                        ],
                      },
                    },
                  },
                },
              },
            },
          },

          totalOrderCost: { $sum: "$productCost" },
          totalOrderRevenue: { $sum: "$revenue" },
          totalOrderProfit: { $sum: "$profit" },
        },
      },

      { $sort: { orderDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const orders = await Order.aggregate(pipeline);
    const totalOrders = await Order.countDocuments(match);

    res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.max(Math.ceil(totalOrders / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get Orders With Profits Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get all unique transactions with items, and profit info
export const getWalkInTransactionsWithProfits = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const searchRegex = new RegExp(normalizeString(search), "i");

    // 🔍 Searchable fields
    const match = search
      ? {
          $or: [
            { buyerName: searchRegex },
            { paymentMethod: searchRegex },
          ],
        }
      : {};

    const pipeline = [
      { $match: match },

      // Lookup item info
      {
        $lookup: {
          from: "items",
          localField: "items.item",
          foreignField: "_id",
          as: "itemsInfo",
        },
      },

      // Expand items array
      { $unwind: "$items" },

      // Join with item info
      {
        $addFields: {
          itemData: {
            $first: {
              $filter: {
                input: "$itemsInfo",
                cond: { $eq: ["$$this._id", "$items.item"] },
              },
            },
          },
        },
      },

      // ✅ Use item.retailPrice for revenue and profit
      {
        $addFields: {
          itemCost: { $multiply: ["$itemData.price", "$items.quantity"] }, // base cost
          itemRevenue: {
            $multiply: ["$itemData.retailPrice", "$items.quantity"],
          },
          itemProfit: {
            $subtract: [
              { $multiply: ["$itemData.retailPrice", "$items.quantity"] },
              { $multiply: ["$itemData.price", "$items.quantity"] },
            ],
          },
        },
      },

      // Group back by transaction
      {
        $group: {
          _id: "$_id",
          buyerName: { $first: "$buyerName" },
          paymentMethod: { $first: "$paymentMethod" },
          createdAt: { $first: "$createdAt" },
          createdBy: { $first: "$createdBy" },
          totalAmount: { $first: "$totalAmount" },

          items: {
            $push: {
              sku: "$itemData.sku",
              name: "$itemData.name",
              variant: "$itemData.variant",
              quantity: "$items.quantity",
              costPerUnit: "$itemData.price",
              retailPrice: "$itemData.retailPrice",
              itemRevenue: "$itemRevenue",
              itemCost: "$itemCost",
              itemProfit: "$itemProfit",
            },
          },

          totalTransactionCost: { $sum: "$itemCost" },
          totalTransactionRevenue: { $sum: "$itemRevenue" },
          totalTransactionProfit: { $sum: "$itemProfit" },
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const transactions = await WalkInTransaction.aggregate(pipeline);
    const totalTransactions = await WalkInTransaction.countDocuments(match);

    res.status(200).json({
      transactions,
      totalTransactions,
      totalPages: Math.max(Math.ceil(totalTransactions / limit), 1),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get Walk-In Transactions With Profits Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

