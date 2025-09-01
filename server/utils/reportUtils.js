import moment from "moment-timezone";
import {
  ReportTypeEnum,
  MovementTypeEnum,
  NewReportTypeEnum,
} from "../enums/enums.js";
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
// export const buildDateFilter = (startDate, endDate) => {
//   if (!startDate && !endDate) return {};
//   const dateFilter = { createdAt: {} };
//   if (startDate)
//     dateFilter.createdAt.$gte = moment
//       .tz(startDate, "Asia/Manila")
//       .startOf("day")
//       .toDate();
//   if (endDate)
//     dateFilter.createdAt.$lte = moment
//       .tz(endDate, "Asia/Manila")
//       .endOf("day")
//       .toDate();
//   return dateFilter;
// };

export const buildDateFilter = (startDate, endDate, field = "createdAt") => {
  const filter = {};
  if (startDate)
    filter[field] = { $gte: moment(startDate).startOf("day").toDate() };
  if (endDate)
    filter[field] = {
      ...filter[field],
      $lte: moment(endDate).endOf("day").toDate(),
    };
  return filter;
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

/**
 * Flattens nested mongoose docs into a row of report data
 * according to the given report columns config.
 */
export const flattenReportData = (rows, columns) => {
  return rows.map((row) => {
    const flatRow = {};
    columns.forEach(({ key }) => {
      let value;

      switch (key) {
        // --- Common fields ---
        case "product":
          value = row.product?.name;
          break;
        case "variant":
          value =
            row.product?.variant ||
            row.item?.variant ||
            row.variant ||
            row.productVariant;
          break;
        case "item":
          value = row.item?.name;
          break;
        case "order":
        case "platformOrderId":
          value = row.order?.platformOrderId || row.platformOrderId;
          break;

        // --- Price handling ---
        case "price":
          if (row.product?.price) {
            value = row.product.price; // Orders / InventoryDetails
          } else if (row.price) {
            value = row.price; // Products / Items / ItemMovements
          }
          break;

        case "totalPrice":
          if (row.product?.price && row.quantity) {
            value = row.product.price * row.quantity; // Orders / InventoryDetails
          } else if (row.price && row.quantity) {
            value = row.price * row.quantity; // Products
          } else {
            value = 0;
          }
          break;

        case "totalValue":
          if (row.totalValue) {
            value = row.totalValue; // ItemMovement (pre-calculated)
          } else if (row.price && row.quantity) {
            value = row.price * row.quantity; // Items
          } else {
            value = 0;
          }
          break;

        // --- Movement Type ---
        case "movementType":
        case "type":
          value = row.movementType || row.type;
          break;

        case "quantity":
          value = row.quantity;
          break;

        // --- Dates ---
        case "createdAt":
        case "updatedAt":
        case "orderDate":
        case "movementDate":
          value = row[key] ? moment(row[key]).format("YYYY-MM-DD") : "";
          break;

        // --- Default ---
        default:
          value = row[key];
      }

      flatRow[key] = value ?? "";
    });

    return flatRow;
  });
};

export const reportColumnsConfig = {
  [NewReportTypeEnum.ORDERS_REPORT]: [
    { key: "product", label: "Product Name", format: "proper", align: "left" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    {
      key: "platform",
      label: "Platform",
      format: "uppercase",
      align: "center",
    },
    {
      key: "platformOrderId",
      label: "Order ID",
      format: "uppercase",
      align: "center",
    },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    {
      key: "price",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "courier", label: "Courier", align: "center" },
    { key: "status", label: "Status", format: "proper", align: "center" },
    { key: "isPaid", label: "Paid", format: "proper", align: "center" },
    { key: "orderDate", label: "Order Date", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.PRODUCTS_REPORT]: [
    { key: "name", label: "Product Name", format: "proper", align: "left" },
    { key: "sku", label: "SKU", format: "uppercase", align: "center" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    { key: "quantity", label: "Stock", format: "number", align: "center" },
    { key: "unit", label: "Unit", format: "lowercase", align: "center" },
    {
      key: "price",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "status", label: "Status", format: "proper", align: "center" },
    { key: "createdAt", label: "Date Added", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.ITEMS_REPORT]: [
    { key: "name", label: "Item Name", format: "proper", align: "left" },
    { key: "sku", label: "SKU", format: "uppercase", align: "center" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    { key: "unit", label: "Unit", format: "lowercase", align: "center" },
    {
      key: "price",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "totalValue",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "status", label: "Status", format: "proper", align: "center" },
    { key: "createdAt", label: "Date Added", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.ITEM_MOVEMENTS_REPORT]: [
    { key: "item", label: "Item Name", format: "proper", align: "left" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    {
      key: "type",
      label: "Movement Type",
      format: "uppercase",
      align: "center",
    },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    {
      key: "price",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "totalValue",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "balanceAfter",
      label: "Balance After",
      format: "number",
      align: "center",
    },
    {
      key: "createdAt",
      label: "Transaction Date",
      format: "date",
      align: "center",
    },
  ],

  [NewReportTypeEnum.INVENTORY_DETAILS_REPORT]: [
    { key: "product", label: "Product Name", format: "proper", align: "left" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    {
      key: "platform",
      label: "Platform",
      format: "uppercase",
      align: "center",
    },
    { key: "order", label: "Order ID", format: "uppercase", align: "center" },
    { key: "order", label: "Order ID", format: "uppercase", align: "center" },
    {
      key: "movementType",
      label: "Movement Type",
      format: "uppercase",
      align: "center",
    },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    {
      key: "price",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "courier", label: "Courier", align: "center" },
    { key: "status", label: "Status", format: "proper", align: "center" },
    {
      key: "createdAt",
      label: "Transaction Date",
      format: "date",
      align: "center",
    },
  ],
};
