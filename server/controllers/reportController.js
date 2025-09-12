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
import {
  buildDateFilter,
  reportColumnsConfig,
  flattenReportData,
} from "../utils/reportUtils.js";

export const getOrdersReport = async (filters = {}) => {
  const { startDate, endDate, paymentStatus, platform, status, orderId } =
    filters;

  const filter = buildDateFilter(startDate, endDate, "orderDate");

  if (paymentStatus && paymentStatus !== "All") {
    if (paymentStatus === "paid") {
      filter.isPaid = true;
    } else if (paymentStatus === "unpaid") {
      filter.isPaid = false;
    }
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

  // console.log("OrdersReportfilter:", filter);

  const rows = await Order.find(filter)
    .populate({
      path: "product",
      populate: { path: "components.item", model: "Item" },
    })
    .lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ORDERS_REPORT]
  );
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
  const mappedRows = rows.map((tx) => {
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

  return flattenReportData(
    mappedRows,
    reportColumnsConfig[NewReportTypeEnum.WALK_INS_REPORT]
  );
};

export const getProductsReport = async (filters = {}) => {
  const { startDate, endDate, status } = filters;

  const filter = buildDateFilter(startDate, endDate, "createdAt");

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  // console.log("ProductsReportfilter:", filter);

  const rows = await Product.find(filter).lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.PRODUCTS_REPORT]
  );
};

export const getItemsReport = async (filters = {}) => {
  const { startDate, endDate, status } = filters;

  const filter = buildDateFilter(startDate, endDate, "createdAt");

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  // console.log("ItemsReportfilter:", filter);

  const rows = await Item.find(filter).lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ITEMS_REPORT]
  );
};

export const getItemMovementsReport = async (filters = {}) => {
  const { startDate, endDate, movementType } = filters;

  const filter = buildDateFilter(startDate, endDate, "createdAt");

  if (movementType && movementType !== "All") {
    filter.type = { $regex: `^${movementType.trim()}$`, $options: "i" };
  }

  // console.log("ItemMovementsReport final filter:", filter);

  const rows = await ItemMovement.find(filter).populate("item").lean();

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.ITEM_MOVEMENTS_REPORT]
  );
};

export const getInventoryDetailsReport = async (filters = {}) => {
  const { startDate, endDate, paymentStatus, movementType, platform, status } =
    filters;

  const query = buildDateFilter(startDate, endDate, "createdAt");

  if (movementType && movementType !== "All") {
    query.movementType = { $regex: `^${movementType.trim()}$`, $options: "i" };
  }

  if (platform && platform !== "All") {
    query.platform = { $regex: `^${platform.trim()}$`, $options: "i" };
  }

  let rows = await InventoryDetail.find(query)
    .populate("product")
    .populate("order")
    .lean();

  // Filter by paymentStatus if needed
  if (paymentStatus && paymentStatus !== "All") {
    rows = rows.filter(
      (row) =>
        row.order &&
        ((paymentStatus === "paid" && row.order.isPaid) ||
          (paymentStatus === "unpaid" && !row.order.isPaid))
    );
  }

  // Filter by Order status
  if (status && status !== "All") {
    const statusRegex = new RegExp(`^${status.trim()}$`, "i");
    rows = rows.filter(
      (row) => row.order && statusRegex.test(row.order.status)
    );
  }

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.INVENTORY_DETAILS_REPORT]
  );
};

export const getOrdersWithProfitsReport = async (filters = {}) => {
  try {
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

    const rows = await Order.aggregate(pipeline);

    // console.log("rows:", rows);
    return flattenReportData(
      rows,
      reportColumnsConfig[NewReportTypeEnum.PROFITS_REPORT]
    );
  } catch (err) {
    console.error("getOrdersWithProfitsReport error:", err);
    throw err;
  }
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
      case NewReportTypeEnum.INVENTORY_DETAILS_REPORT:
        data = await getInventoryDetailsReport({
          startDate,
          endDate,
          paymentStatus,
          movementType,
          platform,
          status,
        });
        // console.log("INVENTORY_DETAILS_REPORT:", data);
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
