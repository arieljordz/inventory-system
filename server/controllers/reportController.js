import mongoose from "mongoose";
import moment from "moment-timezone";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Product from "../models/Product.js";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import ItemMovement from "../models/ItemMovement.js";
import Item from "../models/Item.js";
import { NewReportTypeEnum } from "../enums/enums.js";
import {
  buildDateFilter,
  reportColumnsConfig,
  flattenReportData,
} from "../utils/reportUtils.js";

export const getOrdersReport = async (filters = {}) => {
  const { startDate, endDate, paymentStatus, platform, status } = filters;

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

  const filter = buildDateFilter(startDate, endDate, "createdAt");

  if (movementType && movementType !== "All") {
    filter.movementType = { $regex: `^${movementType.trim()}$`, $options: "i" };
  }

  if (platform && platform !== "All") {
    filter.platform = { $regex: `^${platform.trim()}$`, $options: "i" };
  }

  if (status && status !== "All") {
    filter.status = { $regex: `^${status.trim()}$`, $options: "i" };
  }

  let rows = await InventoryDetail.find(filter)
    .populate("product")
    .populate("order")
    .lean();

  if (paymentStatus && paymentStatus !== "All") {
    rows = rows.filter((row) => {
      if (!row.order) return false;
      if (paymentStatus === "paid") return row.order.isPaid === true;
      if (paymentStatus === "unpaid") return row.order.isPaid === false;
      return true;
    });
  }

  return flattenReportData(
    rows,
    reportColumnsConfig[NewReportTypeEnum.INVENTORY_DETAILS_REPORT]
  );
};

export const generateReport = async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      filters: { platform, paymentStatus, movementType, status },
    } = req.body;

    console.log("req.body:", req.body);
    let data;

    switch (reportType) {
      case NewReportTypeEnum.ORDERS_REPORT:
        data = await getOrdersReport({
          startDate,
          endDate,
          paymentStatus,
          platform,
          status,
        });
        // console.log("ORDERS_REPORT:", data);
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
