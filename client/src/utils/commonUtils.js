import { StatusEnum } from "../enums/enums";

export const formatAmount = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price || 0);

export const parseCurrencyToFloat = (amount) => {
  if (typeof amount === "number") return amount;

  if (typeof amount === "string") {
    const cleaned = amount.replace(/[^0-9.-]+/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

export const formatDateTime = (dateTime) => {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const formatDateString = (dateTime) => {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


export const getCurrentDate = () => {
  const now = new Date();
  const dateNow = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(now); // "en-CA" gives YYYY-MM-DD format
  return dateNow;
};

export const getStatusBadgeData = (
  status,
  customColorMap = {},
  customLabelMap = {}
) => {
  // Normalize status to string
  const statusKey = typeof status === "boolean" ? String(status) : status;

  const defaultColorMap = {
    [StatusEnum.AVAILABLE]: "success",
    [StatusEnum.OUT_OF_STOCK]: "danger",
    [StatusEnum.FOR_PICK_UP]: "warning",
    [StatusEnum.TO_SHIP]: "info",
    [StatusEnum.SHIPPING]: "primary",
    [StatusEnum.RETURNED]: "dark",
    [StatusEnum.DELIVERED]: "success",
    [StatusEnum.COMPLETED]: "secondary",
    true: "success",
    false: "secondary",
  };

  const defaultLabelMap = {
    [StatusEnum.AVAILABLE]: "In Stock",
    [StatusEnum.OUT_OF_STOCK]: "No Stock",
    [StatusEnum.FOR_PICK_UP]: "On Process",
    [StatusEnum.TO_SHIP]: "To Ship",
    [StatusEnum.SHIPPING]: "Shipping",
    [StatusEnum.RETURNED]: "Returned",
    [StatusEnum.DELIVERED]: "Delivered",
    [StatusEnum.COMPLETED]: "Completed",
    true: "Paid",
    false: "Unpaid",
  };

  const colorMap = { ...defaultColorMap, ...customColorMap };
  const labelMap = { ...defaultLabelMap, ...customLabelMap };

  return {
    label: labelMap[statusKey] ?? statusKey,
    color: colorMap[statusKey] ?? "secondary",
  };
};

export const computeTotalPrice = (quantity, price) => {
  const qty = Number(quantity);
  const unitPrice = Number(price);

  if (isNaN(qty) || isNaN(unitPrice) || qty < 0 || unitPrice < 0) {
    return 0;
  }

  return qty * unitPrice;
};

export const truncateText = (text, limit = 30) => {
  if (!text) return "-";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};

export const toProperCase = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

