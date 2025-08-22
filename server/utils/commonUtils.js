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
