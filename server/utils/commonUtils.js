// utils/commonUtils.js

// Escape regex special characters for queries
export const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalize text for storage (only trim/space/lowercase)
export const normalizeString = (val = "") =>
  val.toString().trim().replace(/\s+/g, " ").toLowerCase();
