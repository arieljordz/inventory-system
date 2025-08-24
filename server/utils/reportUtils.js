import moment from "moment-timezone";
import { ReportTypeEnum } from "../enums/enums.js";
import { formatAmount } from "../utils/commonUtils.js";
import InventoryDetail from "../models/InventoryDetail.js";
import Order from "../models/Order.js";

export const formatReportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];
  // console.log("reportData:", reportData);

  return reportData.map((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (reportType.includes(ReportTypeEnum.INVENTORY)) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: date,
        Status: item.status || "-",
      };
    } else {
      const price = item.product?.price || 0;

      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: formatAmount(price),
        "Total Amount": formatAmount(item.totalAmount),
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const formatExportData = (reportData = [], reportType = "") => {
  if (!reportData.length) return [];

  return reportData.map((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (reportType.includes(ReportTypeEnum.INVENTORY)) {
      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        Quantity: item.quantity,
        Type: item.movementType || "-",
        Date: date,
        Status: item.status || "-",
      };
    } else {
      const price = item.product?.price || 0;

      return {
        "Product Name": item.product?.name || "-",
        Variant: item.product?.variant || "-",
        "Platform Order ID": item.platformOrderId || "-",
        Platform: item.platform.toUpperCase() || "-",
        Courier: item.courier || "-",
        Quantity: item.quantity,
        Price: price,
        "Total Amount": item.totalAmount,
        "Payment Status": item.isPaid ? "Paid" : "Unpaid",
      };
    }
  });
};

export const getCenteredColumns = (reportType = "") => {
  //   console.log("reportType:", reportType);
  if (reportType.includes(ReportTypeEnum.INVENTORY)) {
    return ["Variant", "Quantity", "Type", "Date", "Status"];
  } else {
    return [
      "Variant",
      "Platform Order ID",
      "Quantity",
      "Platform",
      "Courier",
      "Date",
      "Payment Status",
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

  if (
    reportType === ReportTypeEnum.SALES ||
    reportType === ReportTypeEnum.SALES_PAID ||
    reportType === ReportTypeEnum.SALES_UNPAID
  ) {
    isSalesReport = true;
    if (reportType === ReportTypeEnum.SALES_PAID) filter.isPaid = true;
    if (reportType === ReportTypeEnum.SALES_UNPAID) filter.isPaid = false;

    data = await Order.find(filter)
      .populate("product", "name price variant")
      .sort({ createdAt: -1 });
  } else {
    if (reportType === ReportTypeEnum.INVENTORY_IN)
      filter.movementType = MovementTypeEnum.IN;
    if (reportType === ReportTypeEnum.INVENTORY_OUT)
      filter.movementType = MovementTypeEnum.OUT;

    data = await InventoryDetail.find(filter)
      .populate("product", "name price variant")
      .sort({ createdAt: -1 });
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
