import moment from "moment";
import { NewReportTypeEnum } from "../enums/enums";

export const reportColumnsConfig = {
  [NewReportTypeEnum.ORDERS_REPORT]: [
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
    {
      key: "orderNumber",
      label: "Order Number",
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
    { key: "status", label: "Status", format: "proper", align: "center" },
    {
      key: "paymentStatus",
      label: "Payment Status",
      format: "proper",
      align: "center",
    },
    { key: "orderDate", label: "Order Date", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.WALK_INS_REPORT]: [
    {
      key: "transactionId",
      label: "Transaction ID",
      format: "uppercase",
      align: "center",
    },
    { key: "itemName", label: "Items", format: "proper", align: "left" },
    {
      key: "total",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "buyerName",
      label: "Customer Name",
      format: "proper",
      align: "center",
    },
    {
      key: "paymentMethod",
      label: "Payment",
      format: "proper",
      align: "center",
    },
    {
      key: "createdAt",
      label: "Transaction Date",
      format: "date",
      align: "center",
    },
  ],

  [NewReportTypeEnum.PRODUCTS_REPORT]: [
    {
      key: "productName",
      label: "Product Name",
      format: "proper",
      align: "left",
    },
    { key: "sku", label: "SKU", format: "uppercase", align: "center" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    { key: "stock", label: "Stock", format: "number", align: "center" },
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
    { key: "dateAdded", label: "Date Added", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.PRODUCT_MOVEMENTS_REPORT]: [
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
    {
      key: "orderNumber",
      label: "Order Number",
      format: "uppercase",
      align: "center",
    },
    {
      key: "movementType",
      label: "Movement Type",
      format: "uppercase",
      align: "center",
    },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    {
      key: "originalPrice",
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
      key: "transactionDate",
      label: "Transaction Date",
      format: "date",
      align: "center",
    },
  ],

  [NewReportTypeEnum.ITEMS_REPORT]: [
    { key: "itemName", label: "Item Name", format: "proper", align: "left" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    { key: "stock", label: "Quantity", format: "number", align: "center" },
    {
      key: "originalPrice",
      label: "Original Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "retailPrice",
      label: "Retail Price",
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
    { key: "dateAdded", label: "Date Added", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.ITEM_MOVEMENTS_REPORT]: [
    { key: "itemName", label: "Item Name", format: "proper", align: "left" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    {
      key: "movementType",
      label: "Movement Type",
      format: "uppercase",
      align: "center",
    },
    { key: "quantity", label: "Quantity", format: "number", align: "center" },
    {
      key: "originalPrice",
      label: "Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "retailPrice",
      label: "Retail Price",
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
      key: "transactionDate",
      label: "Transaction Date",
      format: "date",
      align: "center",
    },
  ],

  [NewReportTypeEnum.PROFITS_REPORT]: [
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
    {
      key: "orderNumber",
      label: "Order Number",
      format: "uppercase",
      align: "center",
    },
    {
      key: "cost",
      label: "Cost",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "revenue",
      label: "Revenue",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "profit",
      label: "Profit",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "status", label: "Status", format: "proper", align: "center" },
    {
      key: "paymentStatus",
      label: "Payment Status",
      format: "proper",
      align: "center",
    },
    { key: "orderDate", label: "Order Date", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.ADJUSTMENTS_REPORT]: [
    {
      key: "targetType",
      label: "Target Type",
      format: "proper",
      align: "center",
    },
    {
      key: "shopName",
      label: "Shop Name",
      format: "proper",
      align: "center",
    },
    {
      key: "targetName",
      label: "Product Name",
      format: "proper",
      align: "left",
    },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    {
      key: "adjustmentType",
      label: "Adjustment Type",
      format: "proper",
      align: "center",
    },
    {
      key: "valueType",
      label: "Value Type",
      format: "proper",
      align: "center",
    },
    {
      key: "value",
      label: "Value",
      format: "uppercase",
      align: "center",
    },
    {
      key: "oldPrice",
      label: "Old Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "newPrice",
      label: "Current Price",
      format: "money",
      align: "right",
      total: true,
    },
    {
      key: "appliedBy",
      label: "Applied By",
      format: "lowercase",
      align: "center",
    },
    {
      key: "dateApplied",
      label: "Applied Date",
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
