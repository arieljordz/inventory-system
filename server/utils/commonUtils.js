import { StatusEnum } from "../enums/enums.js";

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
    [StatusEnum.ON_PROCESS]: "info",
    [StatusEnum.TO_SHIP]: "warning",
    [StatusEnum.SHIPPING]: "primary",
    [StatusEnum.RETURNED]: "dark",
    [StatusEnum.DELIVERED]: "secondary",
    [StatusEnum.COMPLETED]: "success",
    true: "success",
    false: "secondary",
  };

  const defaultLabelMap = {
    [StatusEnum.AVAILABLE]: "In Stock",
    [StatusEnum.OUT_OF_STOCK]: "No Stock",
    [StatusEnum.ON_PROCESS]: "On Process",
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

// Escape regex special characters for queries
export const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalize text for storage & search (lowercased, trimmed, spaces)
export const normalizeString = (val = "") =>
  val.toString().trim().replace(/\s+/g, " ").toLowerCase();

// Normalize text for display fields (preserve symbols like em dash, quotes, etc.)
export const normalizeText = (str = "") => {
  return str
    .normalize("NFC") // normalize unicode representation
    .replace(/\u2013/g, "–") // en dash
    .replace(/\u2014/g, "—") // em dash
    .replace(/\u2018/g, "'") // left single quote → '
    .replace(/\u2019/g, "'") // right single quote → '
    .replace(/\u201C/g, '"') // left double quote → "
    .replace(/\u201D/g, '"') // right double quote → "
    .replace(/\u00A0/g, " ") // non-breaking space → normal space
    .trim();
};

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

export const getCurrentDate = () => {
  const now = new Date();
  const dateNow = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(now); // "en-CA" gives YYYY-MM-DD format
  return dateNow;
};

export function parseOrderDate(orderDate) {
  if (!orderDate) {
    return new Date(); // fallback to now if missing
  }

  // If it's a number → Excel serial number
  if (!isNaN(orderDate)) {
    const serial = Number(orderDate);
    const utcDays = Math.floor(serial - 25569); // days since 1970-01-01
    const utcValue = utcDays * 86400; // seconds
    const dateInfo = new Date(utcValue * 1000);

    // Handle fractional day (time of day)
    const fractionalDay = serial - Math.floor(serial);
    if (fractionalDay > 0) {
      const msInDay = 24 * 60 * 60 * 1000;
      dateInfo.setTime(dateInfo.getTime() + fractionalDay * msInDay);
    }

    return dateInfo;
  }

  // Otherwise assume it's a string that JS can parse
  return new Date(orderDate);
}
