import moment from "moment";
import { ReportTypeEnum, NewReportTypeEnum } from "../enums/enums";
import {
  formatAmount,
  getStatusBadgeData,
  formatDate,
} from "../utils/commonUtils";

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

// utils/reportColumnsConfig.js
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
      key: "totalPrice",
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
      key: "totalPrice",
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

export const formatCellValue = (value, format) => {
  if (value == null) return "";

  switch (format) {
    case "money":
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(value);
    case "number":
      return new Intl.NumberFormat().format(value);
    case "date":
      try {
        return new Date(value).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return "";
      }
    case "uppercase":
      return String(value).toUpperCase();
    case "lowercase":
      return String(value).toLowerCase();
    case "proper":
      return String(value)
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return value;
  }
};
