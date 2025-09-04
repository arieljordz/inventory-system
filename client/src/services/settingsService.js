// services/settingsService.js
import api from "../api/api";

// 🔹 Trigger manual backup (creates folder + JSON files)
export const backupCollections = (collections = ["all"]) =>
  api.post("/api/settings/backup", { collections });

// 🔹 Download a specific backup file (JSON)
// filePath example: "backups_20250905_123000/products.json"
export const downloadBackup = (filePath) =>
  api.get(`/api/settings/backup/download/${encodeURIComponent(filePath)}`, {
    responseType: "blob",
  });

// 🔹 Fetch available MongoDB collections
export const getCollections = () => api.get("/api/settings/collections");
