import moment from "moment-timezone";
import { ReportTypeEnum, MovementTypeEnum } from "../enums/enums.js";
import {
  formatAmount,
  getStatusBadgeData,
  formatDate,
} from "../utils/commonUtils.js";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";
import ItemMovement from "../models/ItemMovement.js";

export const formatReportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];

  return reportData.map((item) => {
    // --- ITEMS REPORTS ---
    if (
      reportType === ReportTypeEnum.ITEMS ||
      reportType === ReportTypeEnum.ITEMS_IN ||
      reportType === ReportTypeEnum.ITEMS_OUT
    ) {
      const { label } = getStatusBadgeData(item.item.status);
      return {
        "Item Name": item.item?.name || "-",
        Variant: item.item?.variant || "-",
        Quantity: item.quantity,
        Type: item.type || "-",
        Price: formatAmount(item.item?.price || 0),
        "Total Price": formatAmount(item.totalValue || 0),
        Status: label,
        Location: item.location || "-",
        Date: formatDate(item.item.createdAt),
      };
    }

    // --- ORDERS REPORTS ---
    if (
      reportType === ReportTypeEnum.ORDERS ||
      reportType === ReportTypeEnum.PRODUCTS_IN ||
      reportType === ReportTypeEnum.PRODUCTS_OUT
    ) {
      const { label } = getStatusBadgeData(item.status);
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: formatDate(item.orderDate),
        Status: label,
      };
    }
    // --- SALES REPORTS ---
    if (
      reportType === ReportTypeEnum.SALES ||
      reportType === ReportTypeEnum.SALES_PAID ||
      reportType === ReportTypeEnum.SALES_UNPAID ||
      reportType === ReportTypeEnum.SALES_SHOPEE ||
      reportType === ReportTypeEnum.SALES_TIKTOK ||
      reportType === ReportTypeEnum.SALES_LAZADA
    ) {
      const price = item.product?.price || 0;
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: formatAmount(price),
        "Total Amount": formatAmount(item.totalAmount),
        Payment: item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const formatExportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];
  return reportData.map((item) => {
    // --- ITEMS REPORTS ---
    if (
      reportType === ReportTypeEnum.ITEMS ||
      reportType === ReportTypeEnum.ITEMS_IN ||
      reportType === ReportTypeEnum.ITEMS_OUT
    ) {
      const { label } = getStatusBadgeData(item.item.status);
      return {
        "Item Name": item.item?.name || "-",
        Variant: item.item?.variant || "-",
        Quantity: item.quantity,
        Type: item.type || "-",
        Price: item.item?.price || 0,
        "Total Price": item.totalValue || 0,
        Status: label,
        Location: item.location || "-",
        Date: formatDate(item.item.createdAt),
      };
    }

    // --- ORDERS REPORTS ---
    if (
      reportType === ReportTypeEnum.ORDERS ||
      reportType === ReportTypeEnum.PRODUCTS_IN ||
      reportType === ReportTypeEnum.PRODUCTS_OUT
    ) {
      const { label } = getStatusBadgeData(item.status);
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: formatDate(item.orderDate),
        Status: label,
      };
    }
    if (
      reportType === ReportTypeEnum.SALES ||
      reportType === ReportTypeEnum.SALES_PAID ||
      reportType === ReportTypeEnum.SALES_UNPAID ||
      reportType === ReportTypeEnum.SALES_SHOPEE ||
      reportType === ReportTypeEnum.SALES_TIKTOK ||
      reportType === ReportTypeEnum.SALES_LAZADA
    ) {
      const price = item.product?.price || 0;
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform?.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: formatAmount(price),
        "Total Amount": formatAmount(item.totalAmount),
        Payment: item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const getCenteredColumns = (reportType = "") => {
  // --- ITEMS REPORTS ---
  if (
    reportType === ReportTypeEnum.ITEMS ||
    reportType === ReportTypeEnum.ITEMS_IN ||
    reportType === ReportTypeEnum.ITEMS_OUT
  ) {
    return ["Variant", "Quantity", "Type", "Status", "Location", "Date"];
  }

  // --- ORDERS REPORTS ---
  if (
    reportType === ReportTypeEnum.ORDERS ||
    reportType === ReportTypeEnum.PRODUCTS_IN ||
    reportType === ReportTypeEnum.PRODUCTS_OUT
  ) {
    return ["Variant", "Quantity", "Type", "Date", "Status"];
  }
  if (
    reportType === ReportTypeEnum.SALES ||
    reportType === ReportTypeEnum.SALES_PAID ||
    reportType === ReportTypeEnum.SALES_UNPAID ||
    reportType === ReportTypeEnum.SALES_SHOPEE ||
    reportType === ReportTypeEnum.SALES_TIKTOK ||
    reportType === ReportTypeEnum.SALES_LAZADA
  ) {
    return [
      "Variant",
      "Platform Order ID",
      "Quantity",
      "Platform",
      "Courier",
      "Date",
      "Payment",
    ];
  }
};

export const getReportFileName = (
  reportType,
  startDate,
  endDate,
  extension
) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}${dd}${yyyy}`;
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `REPORT-${reportType}-${start}-${end}.${extension}`;
};

export const getReportTitleText = (reportType, startDate, endDate) => {
  return `REPORT: ${reportType.toUpperCase()} ${startDate} - ${endDate}`;
};

/** Helper: build date filter for Mongoose */
export const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};
  const dateFilter = { createdAt: {} };
  if (startDate)
    dateFilter.createdAt.$gte = moment
      .tz(startDate, "Asia/Manila")
      .startOf("day")
      .toDate();
  if (endDate)
    dateFilter.createdAt.$lte = moment
      .tz(endDate, "Asia/Manila")
      .endOf("day")
      .toDate();
  return dateFilter;
};

/** Helper: fetch data based on report type */
export const fetchReportData = async (reportType, filter) => {
  let data = [];
  let isSalesReport = false;

  switch (reportType) {
    // --- SALES REPORTS ---
    case ReportTypeEnum.SALES:
      isSalesReport = true;
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.SALES_PAID:
      isSalesReport = true;
      filter.isPaid = true;
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.SALES_UNPAID:
      isSalesReport = true;
      filter.isPaid = false;
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.SALES_SHOPEE:
      filter.platform = "shopee";
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.SALES_TIKTOK:
      filter.platform = "tiktok";
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.SALES_LAZADA:
      filter.platform = "lazada";
      data = await Order.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    // --- ORDERS REPORTS ---
    case ReportTypeEnum.ORDERS:
      data = await InventoryDetail.find()
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.PRODUCTS_IN:
      filter.movementType = MovementTypeEnum.IN;
      data = await InventoryDetail.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.PRODUCTS_OUT:
      filter.movementType = MovementTypeEnum.OUT;
      data = await InventoryDetail.find(filter)
        .populate("product", "name price variant createdAt")
        .sort({ createdAt: -1 });
      break;

    // --- ITEMS REPORTS ---
    case ReportTypeEnum.ITEMS:
      data = await ItemMovement.find()
        .populate(
          "item",
          "name price sku variant unit quantity status location supplier createdAt"
        )
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.ITEMS_IN:
      filter.type = "IN";
      data = await ItemMovement.find(filter)
        .populate(
          "item",
          "name price sku variant unit quantity status location supplier createdAt"
        )
        .sort({ createdAt: -1 });
      break;

    case ReportTypeEnum.ITEMS_OUT:
      filter.type = "OUT";
      data = await ItemMovement.find(filter)
        .populate(
          "item",
          "name price sku variant unit quantity status location supplier createdAt"
        )
        .sort({ createdAt: -1 });
      break;

    default:
      data = [];
      break;
  }

  return { data, isSalesReport };
};

/** Wrap text by column width in points */
export const wrapTextByWidth = (text, font, fontSize, maxWidth) => {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (lineWidth > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

/** Helper: sanitize text for built-in font */
export const sanitizeText = (text = "") => {
  return text.replace(/[^\x00-\xFF]/g, "");
};
