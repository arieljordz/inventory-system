// Helper: escape regex special characters
export const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper: normalize text (trim + collapse spaces + lowercase + safe for regex)
export const normalizeString = (val = "") => {
  const normalized = val.toString().trim().replace(/\s+/g, " ").toLowerCase();
  return escapeRegex(normalized);
};
