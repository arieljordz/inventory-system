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

