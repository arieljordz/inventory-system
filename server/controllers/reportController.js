import mongoose from "mongoose";
import moment from "moment-timezone";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import ItemMovement from "../models/ItemMovement.js";
import Item from "../models/Item.js";
import WalkInTransaction from "../models/WalkInTransaction.js";
import { NewReportTypeEnum } from "../enums/enums.js";
import { buildDateFilter } from "../utils/reportUtils.js";

export const getOrdersReport = async (filters = {}) => {
  const { startDate, endDate, paymentStatus, platform, status, orderId } =
    filters;

  const filter = buildDateFilter(startDate, endDate, "orderDate");

  if (paymentStatus && paymentStatus !== "All") {
    filter.isPaid = paymentStatus === "paid";
  }

  if (platform && platform !== "All") {
    filter.platform = { $regex: `^${platform.trim()}$`, $options: "i" };
  }

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  if (orderId && orderId.trim() !== "") {
    filter.platformOrderId = { $regex: orderId.trim(), $options: "i" };
  }

  // 🔹 Fetch orders with product populated
  const orders = await Order.find(filter).populate("product").lean();

  // 🔹 Transform into flat rows with required columns
  const formattedRows = orders.map((o) => ({
    platform: o.platform,
    platformOrderId: o.platformOrderId,
    quantity: o.quantity,
    price: o.product?.price ?? 0,
    totalPrice: (o.product?.price ?? 0) * o.quantity,
    status: o.status,
    paymentStatus: o.isPaid ? "Paid" : "Unpaid",
    orderDate: o.orderDate,
  }));

  return formattedRows;
};

export const getWalkInsReport = async (filters = {}) => {
  const { startDate, endDate, buyerName, paymentMethod } = filters;

  // Build date filter
  const filter = buildDateFilter(startDate, endDate, "createdAt");

  // Optional filters
  if (buyerName && buyerName.trim() !== "") {
    filter.buyerName = { $regex: buyerName.trim(), $options: "i" };
  }

  if (paymentMethod && paymentMethod !== "All") {
    filter.paymentMethod = {
      $regex: `^${paymentMethod.trim()}$`,
      $options: "i",
    };
  }

  const rows = await WalkInTransaction.find(filter)
    .populate("items.item")
    .lean();

  // Map transactions into report-ready rows
  const formattedRows = rows.map((tx) => {
    // Format each item as "(Quantity)ItemName-Variant"
    const itemNames = tx.items
      .map((i) => {
        const qty = i.quantity;
        const name = i.item.name;
        const variant = i.item.variant ? `-${i.item.variant}` : "";
        return `(${qty})${name}${variant}`;
      })
      .join(", ");

    const totalPrice = tx.items.reduce((sum, i) => sum + i.total, 0);

    return {
      itemName: itemNames,
      quantity: tx.items.reduce((sum, i) => sum + i.quantity, 0), // total quantity
      total: totalPrice,
      buyerName: tx.buyerName,
      paymentMethod: tx.paymentMethod,
      createdAt: tx.createdAt,
    };
  });

  return formattedRows;
};

export const getProductsReport = async (filters = {}) => {
  const { startDate, endDate, status } = filters;

  const filter = {};

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  const products = await Product.find(filter).lean();

  // 🔹 Transform into flat rows with required columns
  const formattedRows = products.map((p) => ({
    productName: p.name,
    sku: p.sku,
    variant: p.variant,
    stock: p.quantity,
    price: p.price,
    totalPrice: (p.price ?? 0) * (p.quantity ?? 0),
    status: p.status,
    dateAdded: p.createdAt,
  }));

  return formattedRows;
};

export const getProductMovementsReport = async (filters = {}) => {
  const { startDate, endDate, movementType, platform, orderId } = filters;

  const match = buildDateFilter(startDate, endDate, "createdAt");

  if (movementType && movementType !== "All") {
    match.movementType = { $regex: `^${movementType.trim()}$`, $options: "i" };
  }

  if (platform && platform !== "All") {
    match.platform = { $regex: `^${platform.trim()}$`, $options: "i" };
  }

  // 🔹 Build pipeline
  const pipeline = [
    { $match: match },

    // join product
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

    // join order
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
  ];

  // 🔹 OrderId filtering must happen *after lookup*
  if (orderId && orderId.trim() !== "") {
    pipeline.push({
      $match: {
        "order.platformOrderId": { $regex: orderId.trim(), $options: "i" },
      },
    });
  }

  const rows = await InventoryDetail.aggregate(pipeline);

  // 🔹 Transform into flat structure
  const formattedRows = rows.map((detail) => ({
    platform: detail.platform || "N/A",
    platformOrderId: detail.order?.platformOrderId || "N/A",
    movementType: detail.movementType || "",
    quantity: detail.quantity || 0,
    originalPrice: detail.product?.price || 0,
    totalPrice: (detail.quantity || 0) * (detail.product?.price || 0),
    transactionDate: detail.createdAt || null,
  }));
  return formattedRows;
};

export const getItemsReport = async (filters = {}) => {
  const { startDate, endDate, status } = filters;

  const filter = {};

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  const items = await Item.find(filter).lean();

  // 🔹 Transform into flat rows with required columns
  const formattedRows = items.map((i) => ({
    itemName: i.name,
    variant: i.variant,
    stock: i.quantity,
    originalPrice: i.price, // from Item.price
    retailPrice: i.retailPrice, // from Item.retailPrice
    totalPrice: (i.retailPrice ?? 0) * (i.quantity ?? 0),
    status: i.status,
    dateAdded: i.createdAt,
  }));

  return formattedRows;
};

export const getItemMovementsReport = async (filters = {}) => {
  const { startDate, endDate, movementType } = filters;

  const filter = buildDateFilter(startDate, endDate, "createdAt");

  if (movementType && movementType !== "All") {
    filter.type = { $regex: `^${movementType.trim()}$`, $options: "i" };
  }

  // 🔹 Query + join item details
  const rows = await ItemMovement.find(filter).populate("item").lean();

  // 🔹 Flatten into top-level structure
  const formattedRows = rows.map((movement) => {
    const item = movement.item || {};

    return {
      itemName: item.name || "",
      variant: item.variant || "",
      movementType: movement.type || "",
      quantity: movement.quantity || 0,
      originalPrice: item.price || 0,
      retailPrice: item.retailPrice || 0,
      totalPrice:
        movement.totalValue || (movement.quantity || 0) * (movement.price || 0),
      balanceAfter: movement.balanceAfter || 0,
      transactionDate: movement.createdAt || null,
    };
  });

  return formattedRows;
};

export const getOrdersWithProfitsReport = async (filters = {}) => {
  const { startDate, endDate, paymentStatus, platform, status, orderId } =
    filters;

  const filter = buildDateFilter(startDate, endDate, "orderDate");

  if (paymentStatus && paymentStatus !== "All") {
    filter.isPaid = paymentStatus === "paid";
  }

  if (platform && platform !== "All") {
    filter.platform = { $regex: `^${platform.trim()}$`, $options: "i" };
  }

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  if (orderId && orderId.trim() !== "") {
    filter.platformOrderId = { $regex: orderId.trim(), $options: "i" };
  }

  const pipeline = [
    { $match: filter },

    // 🔹 Lookup product
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔹 Lookup all items referenced in product.components
    {
      $lookup: {
        from: "items",
        localField: "product.components.item",
        foreignField: "_id",
        as: "items",
      },
    },

    // 🔹 Compute cost, revenue, profit
    {
      $addFields: {
        productCost: {
          $multiply: [
            {
              $sum: {
                $map: {
                  input: "$product.components",
                  as: "comp",
                  in: {
                    $multiply: [
                      {
                        $getField: {
                          field: "price",
                          input: {
                            $first: {
                              $filter: {
                                input: "$items",
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
        revenue: { $multiply: ["$product.price", "$quantity"] },
      },
    },
    {
      $addFields: {
        profit: { $subtract: ["$revenue", "$productCost"] },
      },
    },

    // 🔹 Projection (keep only report fields)
    {
      $project: {
        _id: 0,
        platform: 1,
        platformOrderId: 1,
        status: 1,
        orderDate: 1,
        cost: "$productCost",
        revenue: 1,
        profit: 1,
        paymentStatus: {
          $cond: [{ $eq: ["$isPaid", true] }, "Paid", "Unpaid"],
        },
      },
    },

    { $sort: { orderDate: -1 } },
  ];

  const formattedRows = await Order.aggregate(pipeline);
  return formattedRows;
};

export const generateReport = async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      filters: {
        orderId,
        platform,
        paymentStatus,
        movementType,
        status,
        buyerName,
        paymentMethod,
      },
    } = req.body;

    // console.log("req.body:", req.body);
    let data;

    switch (reportType) {
      case NewReportTypeEnum.ORDERS_REPORT:
        data = await getOrdersReport({
          startDate,
          endDate,
          paymentStatus,
          platform,
          status,
          orderId,
        });
        // console.log("ORDERS_REPORT:", data);
        break;
      case NewReportTypeEnum.WALK_INS_REPORT:
        data = await getWalkInsReport({
          startDate,
          endDate,
          buyerName,
          paymentMethod,
        });
        // console.log("WALK_INS_REPORT:", data);
        break;
      case NewReportTypeEnum.PRODUCTS_REPORT:
        data = await getProductsReport({
          startDate,
          endDate,
          status,
        });
        // console.log("PRODUCTS_REPORT:", data);
        break;
      case NewReportTypeEnum.PRODUCT_MOVEMENTS_REPORT:
        data = await getProductMovementsReport({
          startDate,
          endDate,
          movementType,
          platform,
          orderId,
        });
        // console.log("PRODUCT_MOVEMENTS_REPORT:", data);
        break;
      case NewReportTypeEnum.ITEMS_REPORT:
        data = await getItemsReport({
          startDate,
          endDate,
          status,
        });
        // console.log("ITEMS_REPORT:", data);
        break;
      case NewReportTypeEnum.ITEM_MOVEMENTS_REPORT:
        data = await getItemMovementsReport({
          startDate,
          endDate,
          movementType,
        });
        // console.log("ITEM_MOVEMENTS_REPORT:", data);
        break;
      case NewReportTypeEnum.PROFITS_REPORT:
        data = await getOrdersWithProfitsReport({
          startDate,
          endDate,
          paymentStatus,
          platform,
          status,
          orderId,
        });
        // console.log("PROFITS_REPORT:", data);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Generate Report Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error generating report" });
  }
};
