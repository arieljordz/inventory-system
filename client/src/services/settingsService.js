// services/settingsService.js
import api from "../api/api";

export const backupCollections = (collections = ["all"]) =>
  api.post("/api/settings/backup", { collections });

export const downloadBackup = (filePath) =>
  api.get(`/api/settings/backup/download/${encodeURIComponent(filePath)}`, {
    responseType: "blob",
  });

export const getCollections = () => api.get("/api/settings/collections");

export const getFeatureFlags = () => api.get("/api/settings/feature-flags");

export const getFeatureFlag = (key) =>
  api.get(`/api/settings/feature-flags/${key}`);

export const updateFeatureFlag = (key, enabled) =>
  api.put(`/api/settings/feature-flags/${key}`, { enabled });

export const getOrderByNumber = async (orderNumber) => {
  const res = await api.get(`/api/settings/number/${orderNumber}`);
  return res.data;
};

export const updateOrderById = async (id, updateData) => {
  const res = await api.put(`/api/settings/${id}`, updateData);
  return res.data;
};