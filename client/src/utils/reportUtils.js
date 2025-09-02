import moment from "moment";
import { NewReportTypeEnum } from "../enums/enums";

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
    { key: "payment", label: "Payment", format: "proper", align: "center" },
    { key: "orderDate", label: "Order Date", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.PRODUCTS_REPORT]: [
    { key: "name", label: "Product Name", format: "proper", align: "left" },
    { key: "sku", label: "SKU", format: "uppercase", align: "center" },
    { key: "variant", label: "Variant", format: "proper", align: "center" },
    { key: "quantity", label: "Stock", format: "number", align: "center" },
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
    { key: "variant", label: "Variant", format: "proper", align: "center" },
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
    { key: "payment", label: "Payment", format: "proper", align: "center" },
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
