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
    month: "long", // e.g., "September"
    day: "numeric",
    timeZone: "Asia/Manila",
  });
};

export const getCurrentDate = () => {
  const now = new Date();

  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`; // ✅ YYYY-MM-DD
};

export const getPastWeekDate = () => {
  const now = new Date();

  // Subtract 7 days
  now.setDate(now.getDate() - 7);

  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`; // ✅ YYYY-MM-DD
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
