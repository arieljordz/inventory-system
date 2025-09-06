import moment from "moment-timezone";
import { NewReportTypeEnum } from "../enums/enums.js";

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

// ✅ Column-specific formatters
const columnHandlers = {
  product: (row) => row.product?.name,

  variant: (row) =>
    row.product?.variant ||
    row.item?.variant ||
    row.variant ||
    row.productVariant,

  item: (row) => row.item?.name,

  order: (row) => row.order?.platformOrderId || row.platformOrderId,
  platformOrderId: (row) => row.order?.platformOrderId || row.platformOrderId,

  price: (row) => row.product?.price || row.price || row.item?.price || 0,

  totalPrice: (row) => {
    if (row.product?.price && row.quantity) {
      return row.product.price * row.quantity;
    }
    if (row.price && row.quantity) {
      return row.price * row.quantity;
    }
    return 0;
  },

  totalValue: (row) => {
    if (row.totalValue) return row.totalValue;
    if (row.price && row.quantity) return row.price * row.quantity;
    return 0;
  },

  payment: (row) => (row.order?.isPaid || row?.isPaid ? "Paid" : "Unpaid"),

  movementType: (row) => row.movementType || row.type,
  type: (row) => row.movementType || row.type,

  quantity: (row) => row.quantity,

  status: (row) => row.order?.status || row.status,

  createdAt: (row) =>
    row.createdAt ? moment(row.createdAt).format("YYYY-MM-DD") : "",
  updatedAt: (row) =>
    row.updatedAt ? moment(row.updatedAt).format("YYYY-MM-DD") : "",
  orderDate: (row) =>
    row.orderDate ? moment(row.orderDate).format("YYYY-MM-DD") : "",
  movementDate: (row) =>
    row.movementDate ? moment(row.movementDate).format("YYYY-MM-DD") : "",
};

// ✅ Generic flattener
export const flattenReportData = (rows, columns) => {
  return rows.map((row) => {
    const flatRow = {};

    columns.forEach(({ key }) => {
      const handler = columnHandlers[key];
      const value = handler ? handler(row) : row[key]; // fallback to raw value
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
    { key: "payment", label: "Payment", format: "proper", align: "center" },
    { key: "orderDate", label: "Order Date", format: "date", align: "center" },
  ],

  [NewReportTypeEnum.WALK_INS_REPORT]: [
    { key: "itemName", label: "Items", format: "proper", align: "left" },
    {
      key: "total",
      label: "Total Price",
      format: "money",
      align: "right",
      total: true,
    },
    { key: "buyerName", label: "Buyer", format: "proper", align: "center" },
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
