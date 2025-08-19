// Helper to normalize text (trim + collapse spaces + lowercase)
export const normalizeString = (val = "") =>
  val.toString().trim().replace(/\s+/g, " ").toLowerCase();